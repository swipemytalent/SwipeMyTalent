import { pool } from '../db/pool.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnvValue } from '../utils/getEnv.js';
import { sendPushNotification } from '../utils/sendPushNotification.js';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const completeExchangeHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const connectedUsers: Map<string, string> = req.app.get('connectedUsers');
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;

        const exchangeId = parseInt(req.params.id);
        if (!exchangeId) {
            return res.status(400).json({ message: 'ID de l\'échange requis.' });
        }

        const exchangeResult = await pool.query(
            'SELECT * FROM exchanges WHERE id = $1',
            [exchangeId]
        );
        if (exchangeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Échange non trouvé.' });
        }

        const exchange = exchangeResult.rows[0];
        if (exchange.initiator_id !== userId && exchange.recipient_id !== userId) {
            return res.status(403).json({
                message: 'Vous n\'êtes pas autorisé à terminer cet échange.'
            });
        }

        if (exchange.status !== 'confirmed') {
            return res.status(400).json({
                message: 'L\'échange doit être confirmé par les deux parties avant d\'être terminé.'
            });
        }

        await pool.query(
            `UPDATE exchanges 
             SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
             WHERE id = $1`,
            [exchangeId]
        );

        const otherUserId = (exchange.initiator_id === userId)
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
                otherUserId,
                'exchange_completed',
                {
                    completed_by: userId,
                    exchange_id: exchangeId,
                    completed_by_name: fullName
                }
            ]
        );

        await sendPushNotification(
            otherUserId,
            {
                title: 'Échange terminé',
                body: `${fullName} a marqué l'échange comme terminé.`
            },
            connectedUsers
        );

        res.status(200).json({
            message: 'Échange marqué comme terminé. Vous pouvez maintenant laisser un avis.',
            exchange_id: exchangeId
        });
    } catch (err) {
        console.error('Erreur lors de la finalisation de l\'échange:', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de la finalisation.'
        });
    }
};

export const getUserExchangesHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;

        const exchangesQuery = `
            SELECT 
                e.*,
                initiator.first_name as initiator_first_name,
                initiator.last_name as initiator_last_name,
                initiator.avatar as initiator_avatar,
                initiator.title as initiator_title,
                recipient.first_name as recipient_first_name,
                recipient.last_name as recipient_last_name,
                recipient.avatar as recipient_avatar,
                recipient.title as recipient_title
            FROM exchanges e
            JOIN users initiator ON e.initiator_id = initiator.id
            JOIN users recipient ON e.recipient_id = recipient.id
            WHERE e.initiator_id = $1 OR e.recipient_id = $1
            ORDER BY e.created_at DESC
        `;
        
        const result = await pool.query(exchangesQuery, [userId]);
        const exchanges = result.rows.map(row => ({
            id: row.id,
            description: row.description,
            status: row.status,
            initiator_confirmed: row.initiator_confirmed,
            recipient_confirmed: row.recipient_confirmed,
            created_at: row.created_at,
            completed_at: row.completed_at,
            initiator: {
                id: row.initiator_id,
                firstName: row.initiator_first_name,
                lastName: row.initiator_last_name,
                avatar: row.initiator_avatar,
                title: row.initiator_title
            },
            recipient: {
                id: row.recipient_id,
                firstName: row.recipient_first_name,
                lastName: row.recipient_last_name,
                avatar: row.recipient_avatar,
                title: row.recipient_title
            },
            isInitiator: row.initiator_id === userId
        }));

        res.json(exchanges);
    } catch (err) {
        console.error('Erreur lors de la récupération des échanges:', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de la récupération des échanges.'
        });
    }
};

export const getExchangeRatingHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;

        const exchangeId = parseInt(req.params.id);
        if (!exchangeId) {
            return res.status(400).json({ message: 'ID de l\'échange requis.' });
        }

        const result = await pool.query(
            `SELECT * FROM profile_ratings WHERE exchange_id = $1 AND rater_id = $2`,
            [exchangeId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.json(null);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'avis de l\'échange:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
}; 