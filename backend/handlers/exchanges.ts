import { pool } from '../db/pool.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnvValue } from '../utils/getEnv.js';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

// Types pour les échanges
interface Exchange {
    id: number;
    initiator_id: number;
    recipient_id: number;
    description: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    initiator_confirmed: boolean;
    recipient_confirmed: boolean;
    created_at: Date;
    completed_at?: Date;
}

// Créer un nouvel échange
export const createExchangeHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const initiatorId = decoded.id;

        const { recipient_id, description } = req.body;

        if (!recipient_id || !description) {
            return res.status(400).json({ 
                message: 'ID du destinataire et description requis.' 
            });
        }

        // Vérifier que l'utilisateur ne propose pas un échange avec lui-même
        if (initiatorId === recipient_id) {
            return res.status(400).json({ 
                message: 'Vous ne pouvez pas proposer un échange avec vous-même.' 
            });
        }

        // Vérifier que le destinataire existe et est actif
        const recipientCheck = await pool.query(
            'SELECT id FROM users WHERE id = $1 AND subscribed = TRUE',
            [recipient_id]
        );

        if (recipientCheck.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Destinataire non trouvé ou compte désactivé.' 
            });
        }

        // Créer l'échange
        const result = await pool.query(
            `INSERT INTO exchanges (initiator_id, recipient_id, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [initiatorId, recipient_id, description]
        );

        const exchange = result.rows[0];

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

// Confirmer un échange (initiateur ou destinataire)
export const confirmExchangeHandler = async (req: Request, res: Response, _next: NextFunction) => {
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

        // Récupérer l'échange
        const exchangeResult = await pool.query(
            'SELECT * FROM exchanges WHERE id = $1',
            [exchangeId]
        );

        if (exchangeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Échange non trouvé.' });
        }

        const exchange = exchangeResult.rows[0];

        // Vérifier que l'utilisateur peut confirmer cet échange
        if (exchange.initiator_id !== userId && exchange.recipient_id !== userId) {
            return res.status(403).json({ 
                message: 'Vous n\'êtes pas autorisé à confirmer cet échange.' 
            });
        }

        // Vérifier que l'échange n'est pas déjà terminé
        if (exchange.status === 'completed' || exchange.status === 'cancelled') {
            return res.status(400).json({ 
                message: 'Cet échange est déjà terminé.' 
            });
        }

        // Mettre à jour la confirmation
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

        // Vérifier si les deux parties ont confirmé
        const updatedExchange = await pool.query(
            'SELECT * FROM exchanges WHERE id = $1',
            [exchangeId]
        );

        const updated = updatedExchange.rows[0];
        let newStatus = 'pending';

        if (updated.initiator_confirmed && updated.recipient_confirmed) {
            newStatus = 'confirmed';
            await pool.query(
                'UPDATE exchanges SET status = $1 WHERE id = $2',
                [newStatus, exchangeId]
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

// Marquer un échange comme terminé
export const completeExchangeHandler = async (req: Request, res: Response, _next: NextFunction) => {
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

        // Récupérer l'échange
        const exchangeResult = await pool.query(
            'SELECT * FROM exchanges WHERE id = $1',
            [exchangeId]
        );

        if (exchangeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Échange non trouvé.' });
        }

        const exchange = exchangeResult.rows[0];

        // Vérifier que l'utilisateur peut terminer cet échange
        if (exchange.initiator_id !== userId && exchange.recipient_id !== userId) {
            return res.status(403).json({ 
                message: 'Vous n\'êtes pas autorisé à terminer cet échange.' 
            });
        }

        // Vérifier que l'échange est confirmé
        if (exchange.status !== 'confirmed') {
            return res.status(400).json({ 
                message: 'L\'échange doit être confirmé par les deux parties avant d\'être terminé.' 
            });
        }

        // Marquer comme terminé
        await pool.query(
            `UPDATE exchanges 
             SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
             WHERE id = $1`,
            [exchangeId]
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

// Récupérer les échanges d'un utilisateur
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