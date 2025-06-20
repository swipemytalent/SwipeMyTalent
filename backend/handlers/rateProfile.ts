import { pool } from '../db/pool.js';

import { Request, Response } from 'express';

export const rateProfileHandler = async (req: Request, res: Response) => {
    const raterId = req.body.raterId;
    const raterUserId = parseInt(req.params.userId);
    const rating = parseInt(req.body.rating);
    if (!raterId || !raterUserId || isNaN(rating) || rating < 1 || rating > 5) {
        res.status(400).json({
            message: 'Note invalide. Elle doit être comprise entre 1 et 5.'
        });

        return;
    }

    try {
        await pool.query(`
            INSERT INTO profile_ratings (rater_id, rated_user_id, rating)
            VALUES ($1, $2, $3)
            ON CONFLICT (rater_id, rater_user_id)
            DO UPDATE SET rating = $3
        `, [raterId, raterUserId, rating]);

        res.status(200).json({
            message: 'Votre avis a été enregistrée avec succès.'
        });
    } catch (err) {
        console.error('Erreur lors de la notation:', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de l\'enregistrement de votre avis. Veuillez réessayer.'
        });
    }
};
