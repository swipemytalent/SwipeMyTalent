import { readSecret } from '../utils/readSecret.js';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export let pool: Pool;
if (process.env.NODE_ENV === 'prod') {
    const POSTGRES_USER = readSecret('POSTGRES_USER', 'POSTGRES_USER_FILE');
    const POSTGRES_PASSWORD = readSecret('POSTGRES_PASSWORD', 'POSTGRES_PASSWORD_FILE');
    const POSTGRES_DB = readSecret('POSTGRES_DB', 'POSTGRES_DB_FILE');
    if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !process.env.POSTGRES_HOST || !process.env.POSTGRES_PORT) {
        throw new Error("Missing required PostgreSQL environment variables.");
    }

    pool = new Pool({
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT, 10),
        user: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        database: POSTGRES_DB,
    });
} else {
    if (!process.env.POSTGRES_HOST || !process.env.POSTGRES_PORT || !process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_DB) {
        throw new Error("Missing required PostgreSQL environment variables.");
    }

    pool = new Pool({
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT, 10),
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
    });
}