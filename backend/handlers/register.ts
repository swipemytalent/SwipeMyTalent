import { pool } from '../db/pool.js';

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
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            res.status(409).json({ message: "Email déjà utilisé." });

            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `INSERT INTO users 
            (email, password, first_name, last_name, title, avatar, credits, profile_views, messages) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [email, hashedPassword, firstName, lastName, title, avatar, credits, profileViews, messages]
        );

        res.status(201).json({ message: "Utilisateur enregistré avec succès." });
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Erreur du serveur." });
    }
};
