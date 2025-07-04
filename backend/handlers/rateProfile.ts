import { pool } from '../db/pool.js';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getEnvValue } from '../utils/getEnv.js';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const rateProfileHandler = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const raterId = decoded.id;

        const ratedUserId = parseInt(req.params.userId);
        const { exchange_id, serviceQuality, communication, timeliness } = req.body;

        const scores = [serviceQuality, communication, timeliness].map(Number);

        if (!ratedUserId || !exchange_id || scores.some(score => isNaN(score) || score < 1 || score > 5)) {
            return res.status(400).json({
                message: 'ID de l\'échange et chaque critère doivent avoir une note entre 1 et 5.'
            });
        }

        const exchangeCheck = await pool.query(
            `SELECT * FROM exchanges 
             WHERE id = $1 AND status = 'completed' 
             AND (initiator_id = $2 OR recipient_id = $2)`,
            [exchange_id, raterId]
        );

        if (exchangeCheck.rows.length === 0) {
            return res.status(400).json({
                message: 'Vous ne pouvez noter que les échanges terminés auxquels vous avez participé.'
            });
        }

        const exchange = exchangeCheck.rows[0];

        const otherParticipantId = exchange.initiator_id === raterId
            ? exchange.recipient_id
            : exchange.initiator_id;

        if (otherParticipantId !== ratedUserId) {
            return res.status(400).json({
                message: 'Vous ne pouvez noter que l\'autre participant de cet échange.'
            });
        }

        const existingRating = await pool.query(
            'SELECT id FROM profile_ratings WHERE exchange_id = $1 AND rater_id = $2',
            [exchange_id, raterId]
        );

        if (existingRating.rows.length > 0) {
            return res.status(400).json({
                message: 'Vous avez déjà noté cette personne pour un échange précédent.'
            });
        }

        const averageRating = Math.round(
            (scores[0] + scores[1] + scores[2]) / 3
        );

        console.log('Tentative d\'avis :', { raterId, ratedUserId, exchange_id });

        await pool.query(`
            INSERT INTO profile_ratings (rater_id, rated_user_id, rating, exchange_id)
            VALUES ($1, $2, $3, $4)
        `, [raterId, ratedUserId, averageRating, exchange_id]);

        await pool.query(`
            INSERT INTO notifications (user_id, type, data)
            VALUES ($1, $2, $3)`,
            [
                ratedUserId,
                'profile_rating',
                {
                    raterId,
                    exchangeId: exchange_id,
                    averageRating,
                    message: `Vous avez reçu une nouvelle évaluation de la part d'un utilisateur.`
                }
            ]
        );

        res.status(200).json({
            message: 'Votre avis a été enregistré avec succès.',
            averageRating
        });
    } catch (err) {
        console.error('Erreur lors de la notation :', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de l\'enregistrement de votre avis. Veuillez réessayer.'
        });
    }
};
