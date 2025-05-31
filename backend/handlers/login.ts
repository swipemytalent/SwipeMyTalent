import { pool } from '../db/pool.js';

import bcrypt from 'bcrypt';
import {type Request, type Response, type NextFunction} from 'express';
import jwt from "jsonwebtoken";
import { readSecret } from '../utils/readSecret.js';

let jwt_key: string;

if (process.env.NODE_ENV === 'prod') {
    const JWT_KEY = readSecret('JWT_KEY', 'JWT_KEY_FILE');
    if (!JWT_KEY) {
        throw new Error("JWT secret key is missing. Please define your secret key in your environment configuration to enable JWT signing.");
    }

    jwt_key = JWT_KEY;
} else {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT secret key is missing. Please define your secret key in your environment configuration to enable JWT signing.");
    }

    jwt_key = process.env.JWT_KEY;
}

export const loginHandler = async (req: Request, res: Response, _next: NextFunction) => {
    const requiredFields: { key: string; label: string }[] = [
        { key: "email", label: "Email" },
        { key: "password", label: "Mot de passe" },
    ];
    for (const field of requiredFields) {
        if (!req.body[field.key]) {
            res.status(400).json({ message: `${field.label} requis.` });
        }
    }

    const { email, password } = req.body;
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
            jwt_key,
            { expiresIn: "1h"},
        )

        res.json({ message: "Connexion réussie.", token });
    } catch (err) {
        console.error("DB error:", err);
        res.status(500).json({ message: "Erreur du serveur." });
    }
}
