import { pool } from '../db/pool';
import { getEnvValue } from '../utils/getEnv';

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const getAllUsersHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });

            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const result = await pool.query(
            `SELECT 
                u.id, 
                u.email, 
                u.first_name AS "firstName", 
                u.last_name AS "lastName", 
                u.title, 
                u.avatar, 
                u.bio,
                ROUND(AVG(pr.rating)::numeric, 1) AS "averageRating"
            FROM users u
            LEFT JOIN profile_ratings pr ON u.id = pr.rated_user_id
            WHERE u.id != $1 AND u.subscribed = TRUE
            GROUP BY u.id, u.email, u.first_name, u.last_name, u.title, u.avatar, u.bio`,
            [decoded.id]
        );
        res.json(result.rows);
    } catch (err) {
        
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

export const getUserByIdHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT 
                u.id, 
                u.email, 
                u.first_name AS "firstName", 
                u.last_name AS "lastName", 
                u.title, 
                u.avatar, 
                u.bio,
                ROUND(AVG(pr.rating)::numeric, 1) AS "averageRating"
            FROM users u
            LEFT JOIN profile_ratings pr ON u.id = pr.rated_user_id
            WHERE u.id = $1 AND u.subscribed = TRUE
            GROUP BY u.id, u.email, u.first_name, u.last_name, u.title, u.avatar, u.bio`,
            [userId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Utilisateur non trouvé.' });

            return;
        }

        res.json(result.rows[0]);
    } catch (err) {
        
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

export const getUserRatingsHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.params.id;

    try {
        const result = await pool.query(
            `SELECT pr.*, u.first_name AS "raterFirstName", u.last_name AS "raterLastName" FROM profile_ratings pr
             JOIN users u ON pr.rater_id = u.id
             WHERE pr.rated_user_id = $1
             ORDER BY pr.created_at DESC
             LIMIT 10`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
