import { pool } from '../db/pool.js';
import { getEnvValue } from '../utils/getEnv.js';

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
            `SELECT id, email, first_name AS "firstName", last_name AS "lastName", title, avatar, bio
            FROM users
            WHERE id != $1 AND subscribed = TRUE`,
            [decoded.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('getAllUsers error:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

export const getUserByIdHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const userId = req.params.id;
    try {
        const result = await pool.query(
            `SELECT id, email, first_name AS "firstName", last_name AS "lastName", title, avatar, bio
            FROM users WHERE id = $1 AND subscribed = TRUE`,
            [userId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Utilisateur non trouvé.' });
            return;
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('getUserById error:', err);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};
