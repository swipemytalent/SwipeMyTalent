import { getPool } from '../db/pool.js';
import { getEnvValue } from '../utils/getEnv.js';

import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const JWT_KEY = getEnvValue('JWT_KEY', 'JWT_KEY_FILE')!;

export const loginHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const requiredFields: { key: string; label: string }[] = [
        { key: "email", label: "Email" },
        { key: "password", label: "Mot de passe" },
    ];
    for (const field of requiredFields) {
        if (!req.body[field.key]) {
            res.status(400).json({ message: `${field.label} requis.` });

            return;
        }
    }

    const { email, password } = req.body;
    try {
        const pool = await getPool();
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            res.status(401).json({ message: "Email invalide." });

            return;
        }

        const user = result.rows[0];
        if (user.subscribed === false) {
            res.status(403).json({ message: "Ce compte a été désinscrit. Il sera supprimé prochainement." });
            return;
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(401).json({ message: "Mot de passe invalide." });

            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_KEY,
            { expiresIn: "1h" },
        )

        res.json({ message: "Connexion réussie.", token });
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Erreur du serveur." });
    }
}
