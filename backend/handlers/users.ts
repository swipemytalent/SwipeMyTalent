import { pool } from '../db/pool.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const getAllUsersHandler = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token manquant.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string };
    
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