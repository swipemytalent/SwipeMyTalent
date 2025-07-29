import { pool } from '../db/pool';
import { getEnvValue } from '../utils/getEnv';

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const getVapidPublicKeyHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            res.status(500).json({ message: 'Clé VAPID non configurée.' });

            return;
        }

        res.send(vapidPublicKey);
    } catch (err) {
        
        res.status(500).json({
            message: 'Une erreur est survenue lors de la récupération de la clé VAPID.'
        });
    }
};

export const subscribeToPushHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });

            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;
        const { subscription } = req.body;
        if (!subscription) {
            res.status(400).json({ message: 'Subscription requise.' });

            return;
        }

        const userCheck = await pool.query(
            'SELECT id FROM users WHERE id = $1 AND subscribed = TRUE',
            [userId]
        );
        if (userCheck.rows.length === 0) {
            res.status(404).json({ message: 'Utilisateur non trouvé ou compte désactivé.' });

            return;
        }

        await pool.query(
            'DELETE FROM push_subscriptions WHERE user_id = $1',
            [userId]
        );

        await pool.query(
            `INSERT INTO push_subscriptions (user_id, subscription)
             VALUES ($1, $2)`,
            [userId, JSON.stringify(subscription)]
        );

        res.json({ message: 'Abonnement aux notifications réussi.' });
    } catch (err) {
        
        res.status(500).json({
            message: 'Une erreur est survenue lors de l\'abonnement aux notifications.'
        });
    }
};

export const unsubscribeFromPushHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });

            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;

        await pool.query(
            'DELETE FROM push_subscriptions WHERE user_id = $1',
            [userId]
        );

        res.json({ message: 'Désabonnement des notifications réussi.' });
    } catch (err) {
        
        res.status(500).json({
            message: 'Une erreur est survenue lors du désabonnement des notifications.'
        });
    }
}; 
