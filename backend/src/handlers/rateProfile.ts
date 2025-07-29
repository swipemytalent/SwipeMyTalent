import { pool } from '../db/pool';
import { getEnvValue } from '../utils/getEnv';
import { sendPushNotification } from '../utils/sendPushNotification';

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const rateProfileHandler = async (req: Request, res: Response) => {
    try {
        const connectedUsers: Map<string, string> = req.app.get('connectedUsers');
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });

            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const raterId = decoded.id;
        const ratedUserId = parseInt(req.params.userId);
        const { exchange_id, serviceQuality, communication, timeliness } = req.body;
        
        // Validation plus stricte des données
        if (!exchange_id || typeof exchange_id !== 'number') {
            res.status(400).json({
                message: 'ID de l\'échange requis et doit être un nombre.'
            });
            return;
        }

        if (!serviceQuality || !communication || !timeliness) {
            res.status(400).json({
                message: 'Tous les critères de notation sont requis.'
            });
            return;
        }

        const scores = [serviceQuality, communication, timeliness].map(Number);
        if (scores.some(score => isNaN(score) || score < 1 || score > 5)) {
            res.status(400).json({
                message: 'Chaque critère doit avoir une note entre 1 et 5.'
            });
            return;
        }

        const exchangeCheck = await pool.query(
            `SELECT * FROM exchanges 
             WHERE id = $1 AND (initiator_id = $2 OR recipient_id = $2)`,
            [exchange_id, raterId]
        );
        if (exchangeCheck.rows.length === 0) {
            res.status(400).json({
                message: 'Échange non trouvé ou vous n\'y avez pas participé.'
            });
            return;
        }
        
        const exchange = exchangeCheck.rows[0];
        if (exchange.status !== 'completed') {
            res.status(400).json({
                message: `Vous ne pouvez noter que les échanges terminés. Statut actuel: ${exchange.status}`
            });
            return;
        }

        const otherParticipantId = exchange.initiator_id === raterId
            ? exchange.recipient_id
            : exchange.initiator_id;
        if (otherParticipantId !== ratedUserId) {
            res.status(400).json({
                message: `Vous ne pouvez noter que l'autre participant de cet échange. Vous essayez de noter l'utilisateur ${ratedUserId} mais l'autre participant est ${otherParticipantId}.`
            });
            return;
        }

        const existingRating = await pool.query(
            'SELECT id FROM profile_ratings WHERE exchange_id = $1 AND rater_id = $2',
            [exchange_id, raterId]
        );
        if (existingRating.rows.length > 0) {
            res.status(400).json({
                message: 'Vous avez déjà noté cette personne pour un échange précédent.'
            });

            return;
        }

        const averageRating = Math.round(
            (scores[0] + scores[1] + scores[2]) / 3
        );

        await pool.query(`
            INSERT INTO profile_ratings (rater_id, rated_user_id, rating, exchange_id, service_quality, communication, timeliness)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [raterId, ratedUserId, averageRating, exchange_id, scores[0], scores[1], scores[2]]);

        const raterResult = await pool.query(
            'SELECT first_name, last_name FROM users WHERE id = $1',
            [raterId]
        );
        const { first_name, last_name } = raterResult.rows[0] || {};
        const raterName = first_name && last_name
            ? `${first_name} ${last_name}`
            : 'Un talent';


        await pool.query(`
            INSERT INTO notifications (user_id, type, payload)
            VALUES ($1, $2, $3)`,
            [
                ratedUserId,
                'profile_rating',
                {
                    raterId,
                    raterName,
                    exchangeId: exchange_id,
                    averageRating,
                    message: `${raterName} a laissé un avis sur vous.`
                }
            ]
        );

        await sendPushNotification(
            ratedUserId,
            {
                title: 'Un nouvel avis sur vous',
                body: `${raterName} vous a laissé un avis.`
            },
            connectedUsers,
        )

        res.status(200).json({
            message: 'Votre avis a été enregistré avec succès.',
            averageRating
        });
    } catch (err) {
        
        res.status(500).json({
            message: 'Une erreur est survenue lors de l\'enregistrement de votre avis. Veuillez réessayer.'
        });
    }
};
