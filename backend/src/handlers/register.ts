import { pool } from '../db/pool';
import { EmailService } from '../utils/emailService';

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

export const registerHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const requiredFields: { key: string; label: string }[] = [
        { key: "email", label: "Email" },
        { key: "password", label: "Mot de passe" },
        { key: "firstName", label: "Prénom" },
        { key: "lastName", label: "Nom" },
        { key: "title", label: "Titre" },
        { key: "avatar", label: "Avatar" },
    ];
    for (const field of requiredFields) {
        if (!req.body[field.key]) {
            res.status(400).json({ message: `${field.label} requis.` });
            return;
        }
    }

    const {
        email,
        password,
        firstName,
        lastName,
        title,
        avatar,
        credits = 0,
        profileViews = 0,
        messages = 0,
    } = req.body;

    try {
        // Validation de l'email
        if (!EmailService.isValidEmail(email)) {
            res.status(400).json({ message: "Format d'email invalide." });
            return;
        }

        // Vérification des emails temporaires
        if (EmailService.isTemporaryEmail(email)) {
            res.status(400).json({ 
                message: "Les emails temporaires ne sont pas autorisés. Veuillez utiliser une adresse email valide." 
            });
            return;
        }

        // Vérification de la force du mot de passe
        if (password.length < 8) {
            res.status(400).json({ 
                message: "Le mot de passe doit contenir au moins 8 caractères." 
            });
            return;
        }

        // Vérification des comptes existants par IP (si disponible)
        const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        if (clientIP) {
            const existingAccountsFromIP = await pool.query(
                "SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '24 hours'",
                []
            );
            
            if (existingAccountsFromIP.rows[0].count > 5) {
                res.status(429).json({ 
                    message: "Trop de comptes créés récemment. Veuillez réessayer plus tard." 
                });
                return;
            }
        }

        // Vérification des comptes multiples par email
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            res.status(409).json({ message: "Email déjà utilisé." });
            return;
        }

        // Vérification des comptes multiples par nom/prénom (détection de doublons)
        const similarUsers = await pool.query(
            "SELECT id FROM users WHERE LOWER(first_name) = LOWER($1) AND LOWER(last_name) = LOWER($2) AND created_at > NOW() - INTERVAL '1 hour'",
            [firstName, lastName]
        );
        
        if (similarUsers.rows.length > 0) {
            res.status(400).json({ 
                message: "Un compte avec ce nom a été créé récemment. Veuillez contacter le support si nécessaire." 
            });
            return;
        }

        // Génération du token de vérification
        const verificationToken = EmailService.generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users 
            (email, password, first_name, last_name, title, avatar, credits, profile_views, messages, email_verification_token, email_verification_expires) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [email, hashedPassword, firstName, lastName, title, avatar, credits, profileViews, messages, verificationToken, verificationExpires]
        );

        // Envoi de l'email de vérification
        const emailSent = await EmailService.sendVerificationEmail(email, verificationToken, firstName);
        
        if (!emailSent) {
            // Si l'email n'a pas pu être envoyé, on supprime l'utilisateur
            await pool.query("DELETE FROM users WHERE email = $1", [email]);
            res.status(500).json({ 
                message: "Erreur lors de l'envoi de l'email de vérification. Veuillez réessayer." 
            });
            return;
        }

        res.status(201).json({ 
            message: "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte." 
        });
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Erreur du serveur." });
    }
};
