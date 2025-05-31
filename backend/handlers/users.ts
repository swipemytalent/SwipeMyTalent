import { pool } from '../db/pool.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { readSecret } from '../utils/readSecret.js';

let jwt_key: string;

if (process.env.NODE_ENV === 'prod') {
    const JWT_KEY = readSecret('JWT_KEY', 'JWT_KEY_FILE');
    if (!JWT_KEY) {
        throw new Error("JWT secret key is missing. Please define your secret key in your environment configuration to enable JWT signing.");
    }

    jwt_key = JWT_KEY;
} else {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT secret key is missing. Please define your secret key in your environment configuration to enable JWT signing.");
    }

    jwt_key = process.env.JWT_KEY;
}

export const getAllUsersHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token manquant.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwt_key) as { id: number, email: string };
    
    const result = await pool.query(
      `SELECT id, email, first_name AS "firstName", last_name AS "lastName", title, avatar, bio
       FROM users
       WHERE id != $1`,
      [decoded.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}; 