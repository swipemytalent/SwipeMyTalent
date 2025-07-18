import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { EmailService } from '../services/emailService';

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
        res.status(400).json({ success: false, message: 'Token manquant' });
        return;
    }
    try {
        const result = await pool.query(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.email_verified, ev.expires_at 
             FROM users u
             JOIN email_verifications ev ON u.id = ev.user_id
             WHERE ev.token = $1 AND ev.used = false`,
            [token]
        );
        if (result.rows.length === 0) {
            res.status(400).json({ success: false, message: 'Token invalide ou déjà utilisé' });
            return;
        }
        const user = result.rows[0];
        if (user.email_verified) {
            res.status(400).json({ success: false, message: 'Email déjà vérifié' });
            return;
        }
        if (new Date(user.expires_at) < new Date()) {
            res.status(400).json({ success: false, message: 'Token expiré' });
            return;
        }
        
        // Marquer le token comme utilisé et vérifier l'email
        await pool.query('UPDATE email_verifications SET used = true WHERE token = $1', [token]);
        await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [user.id]);
        
        // Envoyer un email de bienvenue
        const username = `${user.first_name} ${user.last_name}`;
        const welcomeEmailSent = await EmailService.sendWelcomeEmail(user.email, username);
        
        if (!welcomeEmailSent) {
            console.error('❌ Échec de l\'envoi de l\'email de bienvenue');
            // On continue quand même, la vérification est réussie
        }
        
        res.json({ success: true, message: 'Email vérifié avec succès !' });
    } catch (err) {
        console.error('Erreur vérification email:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
}; 