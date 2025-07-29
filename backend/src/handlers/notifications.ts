import { pool } from '../db/pool';
import { getEnvValue } from '../utils/getEnv';

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const getUserNotificationsHandler = async (req: Request, res: Response, _next: NextFunction) => {
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;
        
        const result = await pool.query(
            `SELECT id, type, payload, is_read, created_at
             FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [userId]
        );

        res.json(result.rows);
    } catch (err) {
        
        res.status(500).json({
            message: 'Une erreur est survenue lors de la récupération des notifications.'
        });
    }
};

export const markNotificationAsReadHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const notificationId = req.params.id;
    
    
    
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;
        
        
        if (!notificationId || isNaN(Number(notificationId))) {
            
            res.status(400).json({ message: 'ID de notification requis.' });
            return;
        }

        
        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );
        
        if (result.rowCount === 0) {
            
            res.status(404).json({ message: 'Notification non trouvée.' });
            return;
        }

        
        res.json({ message: 'Notification marquée comme lue.' });
    } catch (err) {
        
        
        res.status(500).json({
            message: 'Une erreur est survenue lors du marquage de la notification.'
        });
    }
};

export const markAllNotificationsAsReadHandler = async (req: Request, res: Response, _next: NextFunction) => {
    
    
    
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
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE user_id = $1`,
            [userId]
        );

        
        res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
    } catch (err) {
        
        
        res.status(500).json({
            message: 'Une erreur est survenue lors du marquage des notifications.'
        });
    }
};

export const deleteNotificationHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const notificationId = req.params.id;
    
    
    
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;
        
        
        if (!notificationId || isNaN(Number(notificationId))) {
            
            res.status(400).json({ message: 'ID de notification requis.' });
            return;
        }

        
        const result = await pool.query(
            `DELETE FROM notifications 
             WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );
        
        if (result.rowCount === 0) {
            
            res.status(404).json({ message: 'Notification non trouvée.' });
            return;
        }

        
        res.json({ message: 'Notification supprimée.' });
    } catch (err) {
        
        
        res.status(500).json({
            message: 'Une erreur est survenue lors de la suppression de la notification.'
        });
    }
}; 
