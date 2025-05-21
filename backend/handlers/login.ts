import { pool } from '../db/pool.js';

import bcrypt from 'bcrypt';
import {type Request, type Response, type NextFunction} from 'express';
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret key is missing. Please define your secret key in your environment configuration to enable JWT signing.");
}

const JWT_SECRET = process.env.JWT_SECRET;

export const loginHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email et mot de passe requis." });
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            res.status(401).json({ message: "Email invalide." });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(401).json({ message: "Mot de passe invalide." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h"},
        )

        res.json({ message: "Connexion réussie.", token });
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Erreur du serveur." });
    }
}
