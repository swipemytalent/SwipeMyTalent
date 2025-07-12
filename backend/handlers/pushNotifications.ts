import { pool } from '../db/pool.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getEnvValue } from '../utils/getEnv.js';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const getVapidPublicKeyHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            return res.status(500).json({ message: 'Clé VAPID non configurée.' });
        }
        res.send(vapidPublicKey);
    } catch (err) {
        console.error('Erreur lors de la récupération de la clé VAPID:', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de la récupération de la clé VAPID.'
        });
    }
};

export const subscribeToPushHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;

        const { subscription } = req.body;
        if (!subscription) {
            return res.status(400).json({ message: 'Subscription requise.' });
        }

        const userCheck = await pool.query(
            'SELECT id FROM users WHERE id = $1 AND subscribed = TRUE',
            [userId]
        );
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé ou compte désactivé.' });
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

        console.log(`✅ Utilisateur ${userId} abonné aux notifications push`);
        res.json({ message: 'Abonnement aux notifications réussi.' });
    } catch (err) {
        console.error('Erreur lors de l\'abonnement aux notifications:', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de l\'abonnement aux notifications.'
        });
    }
};

export const unsubscribeFromPushHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;

        await pool.query(
            'DELETE FROM push_subscriptions WHERE user_id = $1',
            [userId]
        );

        console.log(`❌ Utilisateur ${userId} désabonné des notifications push`);
        res.json({ message: 'Désabonnement des notifications réussi.' });
    } catch (err) {
        console.error('Erreur lors du désabonnement des notifications:', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors du désabonnement des notifications.'
        });
    }
}; 