import { pool } from '../db/pool.js';
import { getEnvValue } from '../utils/getEnv.js';

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const profileHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });

            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userResult = await pool.query(
            'SELECT id, email, first_name AS "firstName", last_name AS "lastName", title, avatar, bio FROM users WHERE id = $1',
            [decoded.id]
        );
        if (userResult.rows.length === 0) {
            res.status(404).json({ message: 'Utilisateur non trouvé.' });

            return;
        }

        const profile = userResult.rows[0];
        const ratingResult = await pool.query(
            'SELECT ROUND(AVG(rating)::numeric, 1) AS "averageRating" FROM profile_ratings WHERE rated_user_id = $1',
            [decoded.id]
        );

        profile.averageRating = ratingResult.rows[0].averageRating ?? null;
        res.json(profile);
    } catch (err) {
        console.error('Erreur lors de la récupération du profil:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

export const updateProfileHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });

            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const { firstName, lastName, title, avatar, bio } = req.body;
        await pool.query(
            'UPDATE users SET first_name = $1, last_name = $2, title = $3, avatar = $4, bio = $5 WHERE id = $6',
            [firstName, lastName, title, avatar, bio, decoded.id]
        );
        const result = await pool.query(
            'SELECT email, first_name AS "firstName", last_name AS "lastName", title, avatar, bio FROM users WHERE id = $1',
            [decoded.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
