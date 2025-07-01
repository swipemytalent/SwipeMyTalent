import { getPool } from '../db/pool.js';

import { Request, Response, NextFunction } from 'express';

export const unsubscribeHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({
            error: 'Email is required to unsubscribe'
        });

        return;
    }

    try {
        const pool = await getPool();
        const result = await pool.query(
            'UPDATE users SET subscribed = FALSE, unsubscribed_at = NOW() WHERE email = $1 RETURNING *',
            [email]
        );
        if (result.rowCount === 0) {
            res.status(404).json({
                error: 'User not found.'
            });

            return;
        }

        res.status(200).json({
            message: 'You have been unsubscribed. Your account will be deleted after 14 days.'
        });
    } catch (error) {
        console.error('Error unsubscribing user:', error);
        res.status(500).json({
            error: 'Internal server error.'
        });
    }
}
