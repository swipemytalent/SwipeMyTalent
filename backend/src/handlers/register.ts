import { pool } from '../db/pool';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            res.status(409).json({ message: "Email déjà utilisé." });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Insérer l'utilisateur avec email_verified = false
        const userResult = await pool.query(
            `INSERT INTO users 
            (email, password, first_name, last_name, title, avatar, credits, profile_views, messages, email_verified) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING id`,
            [email, hashedPassword, firstName, lastName, title, avatar, credits, profileViews, messages, false]
        );
        const userId = userResult.rows[0].id;
        // Générer le token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        // Stocker le token
        await pool.query(
            'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
            [userId, token, expiresAt]
        );
        // Envoyer le mail (console en dev)
        const url = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${token}`;
        if (process.env.NODE_ENV === 'dev') {
            console.log('--- EMAIL DE VALIDATION ---');
            console.log('À :', email);
            console.log('Lien :', url);
            console.log('---------------------------');
        }
        res.status(201).json({ message: "Inscription réussie ! Vérifiez votre email pour activer votre compte.", requiresVerification: true });
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Erreur du serveur." });
    }
};
