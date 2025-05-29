import { pool } from '../db/pool.js';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const profileHandler = async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token manquant.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string };
    const result = await pool.query(
      'SELECT id, email, first_name AS "firstName", last_name AS "lastName", title, avatar, bio FROM users WHERE id = $1',
      [decoded.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Utilisateur non trouvé.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Profile error:', err);
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
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string };
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