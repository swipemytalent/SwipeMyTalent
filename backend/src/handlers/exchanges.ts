import { pool } from '../db/pool';
import { getEnvValue } from '../utils/getEnv';
import { sendPushNotification } from '../utils/sendPushNotification';

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const createExchangeHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const connectedUsers: Map<string, string> = req.app.get('connectedUsers');
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });

            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const initiatorId = decoded.id;
        const { recipient_id, description } = req.body;
        if (!recipient_id || !description) {
            res.status(400).json({
                message: 'ID du destinataire et description requis.'
            });

            return;
        }

        if (initiatorId === recipient_id) {
            res.status(400).json({
                message: 'Vous ne pouvez pas proposer un échange avec vous-même.'
            });

            return;
        }

        const recipientCheck = await pool.query(
            'SELECT id FROM users WHERE id = $1 AND subscribed = TRUE',
            [recipient_id]
        );
        if (recipientCheck.rows.length === 0) {
            res.status(404).json({
                message: 'Destinataire non trouvé ou compte désactivé.'
            });

            return;
        }

        const result = await pool.query(
            `INSERT INTO exchanges (initiator_id, recipient_id, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [initiatorId, recipient_id, description]
        );
        const exchange = result.rows[0];
        const userResult = await pool.query(
            'SELECT first_name, last_name FROM users WHERE id = $1',
            [initiatorId]
        );
        const { first_name, last_name } = userResult.rows[0] || {};
        const initiatorName = first_name && last_name
            ? `${first_name} ${last_name}`
            : 'Un talent';

        await pool.query(
            `INSERT INTO notifications (user_id, type, payload)
            VALUES ($1, $2, $3)`,
            [
                recipient_id,
                'exchange_requested',
                {
                    initiatorId,
                    initiatorName,
                    exchange_id: exchange.id,
                    description
                }
            ]
        );

        await sendPushNotification(
            recipient_id,
            {
                title: `Nouvelle proposition d'échange`,
                body: `${initiatorName} vous a proposé un échange.`
            },
            connectedUsers
        );

        res.status(201).json({
            message: 'Échange proposé avec succès.',
            exchange: {
                id: exchange.id,
                initiator_id: exchange.initiator_id,
                recipient_id: exchange.recipient_id,
                description: exchange.description,
                status: exchange.status,
                initiator_confirmed: exchange.initiator_confirmed,
                recipient_confirmed: exchange.recipient_confirmed,
                created_at: exchange.created_at
            }
        });
    } catch (err) {
        console.error('Erreur lors de la création de l\'échange:', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de la création de l\'échange.'
        });
    }
};

export const confirmExchangeHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const connectedUsers: Map<string, string> = req.app.get('connectedUsers');
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });

            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;
        const exchangeId = parseInt(req.params.id);
        if (!exchangeId) {
            res.status(400).json({ message: 'ID de l\'échange requis.' });

            return;
        }

        const exchangeResult = await pool.query(
            'SELECT * FROM exchanges WHERE id = $1',
            [exchangeId]
        );
        if (exchangeResult.rows.length === 0) {
            res.status(404).json({ message: 'Échange non trouvé.' });

            return;
        }

        const exchange = exchangeResult.rows[0];
        if (exchange.initiator_id !== userId && exchange.recipient_id !== userId) {
            res.status(403).json({
                message: 'Vous n\'êtes pas autorisé à confirmer cet échange.'
            });

            return;
        }

        if (exchange.status === 'completed' || exchange.status === 'cancelled') {
            res.status(400).json({
                message: 'Cet échange est déjà terminé.'
            });

            return;
        }

        let updateField = '';
        if (exchange.initiator_id === userId) {
            updateField = 'initiator_confirmed = TRUE';
        } else {
            updateField = 'recipient_confirmed = TRUE';
        }

        await pool.query(
            `UPDATE exchanges SET ${updateField} WHERE id = $1`,
            [exchangeId]
        );

        const updatedExchange = await pool.query(
            'SELECT * FROM exchanges WHERE id = $1',
            [exchangeId]
        );
        const updated = updatedExchange.rows[0];
        let newStatus = updated.status; // Utiliser le statut actuel
        
        if (updated.initiator_confirmed && updated.recipient_confirmed) {
            newStatus = 'confirmed';
            await pool.query(
                'UPDATE exchanges SET status = $1 WHERE id = $2',
                [newStatus, exchangeId]
            );

            const targetUserId = (exchange.initiator_id === userId)
                ? exchange.recipient_id
                : exchange.initiator_id;
            const userResult = await pool.query(
                'SELECT first_name, last_name FROM users WHERE id = $1',
                [userId]
            );
            const { first_name, last_name } = userResult.rows[0] || {};
            const fullName = first_name && last_name
                ? `${first_name} ${last_name}`
                : 'Un talent';

            await pool.query(
                `INSERT INTO notifications (user_id, type, payload)
                VALUES ($1, $2, $3)`,
                [
                    targetUserId,
                    'exchange_confirmed',
                    {
                        by_user_id: userId,
                        exchange_id: exchangeId,
                        by_user_name: fullName
                    }
                ]
            );

            await sendPushNotification(
                targetUserId,
                {
                    title: 'Échange confirmé',
                    body: `${fullName} a confirmé l'échange.`
                },
                connectedUsers
            );
        }

        res.status(200).json({
            message: 'Échange confirmé avec succès.',
            status: newStatus
        });
    } catch (err) {
        console.error('Erreur lors de la confirmation de l\'échange:', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de la confirmation.'
        });
    }
}; 
