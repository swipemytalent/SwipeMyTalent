import { pool } from '../db/pool.js';

import {type Request, type Response, type NextFunction} from 'express';
import bcrypt from 'bcrypt';

export const registerHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email et mot de passe requis." });
    }

    try {
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            res.status(409).json({ message: "Email déjà utilisé." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [email, hashedPassword]
        );

        res.status(201).json({ message: "Utilisateur enregistré avec succès." });
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Erreur du serveur." });
    }
}
