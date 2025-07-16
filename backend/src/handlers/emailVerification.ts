import { pool } from '../db/pool';
import { Request, Response, NextFunction } from 'express';

export const verifyEmailHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const { token } = req.body;
    
    if (!token) {
        res.status(400).json({ message: "Token de vérification requis." });
        return;
    }

    try {
        // Vérifier si le token existe et n'est pas expiré
        const userResult = await pool.query(
            `SELECT id, email, email_verification_expires 
             FROM users 
             WHERE email_verification_token = $1 AND email_verified = FALSE`,
            [token]
        );

        if (userResult.rows.length === 0) {
            res.status(400).json({ 
                message: "Token de vérification invalide ou déjà utilisé." 
            });
            return;
        }

        const user = userResult.rows[0];
        const now = new Date();
        const expiresAt = new Date(user.email_verification_expires);

        if (now > expiresAt) {
            res.status(400).json({ 
                message: "Le lien de vérification a expiré. Veuillez demander un nouveau lien." 
            });
            return;
        }

        // Marquer l'email comme vérifié
        await pool.query(
            `UPDATE users 
             SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL 
             WHERE id = $1`,
            [user.id]
        );

        res.json({ 
            message: "Email vérifié avec succès. Votre compte est maintenant actif." 
        });
    } catch (err) {
        console.error("Erreur lors de la vérification de l'email:", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

export const resendVerificationEmailHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body;
    
    if (!email) {
        res.status(400).json({ message: "Email requis." });
        return;
    }

    try {
        // Vérifier si l'utilisateur existe et n'a pas encore vérifié son email
        const userResult = await pool.query(
            `SELECT id, email, email_verified 
             FROM users 
             WHERE email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            res.status(404).json({ 
                message: "Aucun compte trouvé avec cet email." 
            });
            return;
        }

        const user = userResult.rows[0];

        if (user.email_verified) {
            res.status(400).json({ 
                message: "Cet email est déjà vérifié." 
            });
            return;
        }

        // Générer un nouveau token
        const { EmailService } = await import('../utils/emailService');
        const verificationToken = EmailService.generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        // Mettre à jour le token
        await pool.query(
            `UPDATE users 
             SET email_verification_token = $1, email_verification_expires = $2 
             WHERE id = $3`,
            [verificationToken, verificationExpires, user.id]
        );

        // Envoyer le nouvel email
        const emailSent = await EmailService.sendVerificationEmail(email, verificationToken);
        
        if (!emailSent) {
            res.status(500).json({ 
                message: "Erreur lors de l'envoi de l'email. Veuillez réessayer." 
            });
            return;
        }

        res.json({ 
            message: "Nouvel email de vérification envoyé." 
        });
    } catch (err) {
        console.error("Erreur lors de la réexpédition de l'email:", err);
        res.status(500).json({ message: "Erreur serveur." });
    }
}; 