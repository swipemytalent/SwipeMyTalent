import { pool } from '../db/pool';
import { getEnvValue } from '../utils/getEnv';

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const getUserNotificationsHandler = async (req: Request, res: Response, _next: NextFunction) => {
    console.log('[PROD] Route /notifications appelée');
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
        console.error('[PROD] Erreur route /notifications :', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de la récupération des notifications.'
        });
    }
};

export const markNotificationAsReadHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const notificationId = req.params.id;
    console.log('[PROD] Route /notifications/:id/read appelée - markNotificationAsReadHandler');
    console.log('[PROD] Notification ID:', notificationId);
    console.log('[PROD] Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[PROD] Token manquant ou invalide');
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        console.log('[PROD] Tentative de vérification du token JWT...');
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;
        console.log('[PROD] Token décodé, user ID:', userId);
        
        if (!notificationId) {
            console.log('[PROD] ID de notification manquant');
            res.status(400).json({ message: 'ID de notification requis.' });
            return;
        }

        console.log('[PROD] Tentative de marquage de la notification comme lue...');
        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );
        
        if (result.rowCount === 0) {
            console.log('[PROD] Notification non trouvée ou non autorisée');
            res.status(404).json({ message: 'Notification non trouvée.' });
            return;
        }

        console.log('[PROD] Notification marquée comme lue avec succès');
        res.json({ message: 'Notification marquée comme lue.' });
    } catch (err) {
        console.error('[PROD] Erreur route /notifications/:id/read - markNotificationAsReadHandler:', err);
        console.error('[PROD] Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace');
        res.status(500).json({
            message: 'Une erreur est survenue lors du marquage de la notification.'
        });
    }
};

export const markAllNotificationsAsReadHandler = async (req: Request, res: Response, _next: NextFunction) => {
    console.log('[PROD] Route /notifications/read-all appelée - markAllNotificationsAsReadHandler');
    console.log('[PROD] Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[PROD] Token manquant ou invalide');
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        console.log('[PROD] Tentative de vérification du token JWT...');
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;
        console.log('[PROD] Token décodé, user ID:', userId);

        console.log('[PROD] Tentative de marquage de toutes les notifications comme lues...');
        await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE user_id = $1`,
            [userId]
        );

        console.log('[PROD] Toutes les notifications marquées comme lues avec succès');
        res.json({ message: 'Toutes les notifications ont été marquées comme lues.' });
    } catch (err) {
        console.error('[PROD] Erreur route /notifications/read-all - markAllNotificationsAsReadHandler:', err);
        console.error('[PROD] Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace');
        res.status(500).json({
            message: 'Une erreur est survenue lors du marquage des notifications.'
        });
    }
};

export const deleteNotificationHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const notificationId = req.params.id;
    console.log('[PROD] Route /notifications/:id appelée - deleteNotificationHandler');
    console.log('[PROD] Notification ID:', notificationId);
    console.log('[PROD] Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[PROD] Token manquant ou invalide');
            res.status(401).json({ message: 'Token manquant.' });
            return;
        }

        const token = authHeader.split(' ')[1];
        console.log('[PROD] Tentative de vérification du token JWT...');
        const decoded = jwt.verify(token, JWT_KEY) as { id: number, email: string };
        const userId = decoded.id;
        console.log('[PROD] Token décodé, user ID:', userId);
        
        if (!notificationId) {
            console.log('[PROD] ID de notification manquant');
            res.status(400).json({ message: 'ID de notification requis.' });
            return;
        }

        console.log('[PROD] Tentative de suppression de la notification...');
        const result = await pool.query(
            `DELETE FROM notifications 
             WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );
        
        if (result.rowCount === 0) {
            console.log('[PROD] Notification non trouvée ou non autorisée');
            res.status(404).json({ message: 'Notification non trouvée.' });
            return;
        }

        console.log('[PROD] Notification supprimée avec succès');
        res.json({ message: 'Notification supprimée.' });
    } catch (err) {
        console.error('[PROD] Erreur route /notifications/:id - deleteNotificationHandler:', err);
        console.error('[PROD] Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace');
        res.status(500).json({
            message: 'Une erreur est survenue lors de la suppression de la notification.'
        });
    }
}; 
