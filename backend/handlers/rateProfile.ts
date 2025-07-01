import { getPool } from '../db/pool.js';

import { Request, Response } from 'express';

export const rateProfileHandler = async (req: Request, res: Response) => {
    const raterId = req.body.raterId;
    const raterUserId = parseInt(req.params.userId);
    const {
        serviceQuality,
        communication,
        timeliness
    } = req.body;
    const scores = [serviceQuality, communication, timeliness].map(Number);
    if (!raterId || !raterUserId || scores.some(score => isNaN(score) || score < 1 || score > 5)) {
        res.status(400).json({
            message: 'Chaque critère doit avoir une note entre 1 et 5.'
        });

        return;
    }

    const averageRating = Math.round(
        (scores[0] + scores[1] + scores[2]) / 3
    );

    try {
        const pool = await getPool();
        await pool.query(`
            INSERT INTO profile_ratings (rater_id, rated_user_id, rating)
            VALUES ($1, $2, $3)
            ON CONFLICT (rater_id, rated_user_id)
            DO UPDATE SET rating = $3
        `, [raterId, raterUserId, averageRating]);

        res.status(200).json({
            message: 'Votre avis a été enregistré avec succès.',
            averageRating
        });
    } catch (err) {
        console.error('Erreur lors de la notation :', err);
        res.status(500).json({
            message: 'Une erreur est survenue lors de l\'enregistrement de votre avis. Veuillez réessayer.'
        });
    }
};
