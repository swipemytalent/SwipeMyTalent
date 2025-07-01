import { getEnvValue } from '../utils/getEnv.js';

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_USER = getEnvValue('POSTGRES_USER', 'POSTGRES_USER_FILE');
const POSTGRES_PASSWORD = getEnvValue('POSTGRES_PASSWORD', 'POSTGRES_PASSWORD_FILE');
const POSTGRES_DB = getEnvValue('POSTGRES_DB', 'POSTGRES_DB_FILE');
const POSTGRES_HOST = getEnvValue('POSTGRES_HOST', 'POSTGRES_HOST_FILE');
const POSTGRES_PORT = getEnvValue('POSTGRES_PORT', 'POSTGRES_PORT_FILE');
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

const pool = new Pool({
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT!, 10),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
});

async function connectWithRetry(retries = MAX_RETRIES, delayMs = RETRY_DELAY_MS) {
    for (let i = 0; i < retries; i++) {
        try {
            await pool.query('SELECT 1');
            console.log('Postgres connected');

            return;
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(`Postgres connection failed (attempt ${i + 1}):`, err.message);
            } else {
                console.error(`Unknown error:`, err);
            }

            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delayMs));
            } else {
                throw new Error('Failed to connect to Postgres after multiple attempts');
            }
        }
    }
}

export async function getPool() {
    await connectWithRetry();

    return pool;
}
