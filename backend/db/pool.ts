import { getEnvValue } from '../utils/getEnv.js';

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const POSTGRES_USER = getEnvValue('POSTGRES_USER', 'POSTGRES_USER_FILE');
const POSTGRES_PASSWORD = getEnvValue('POSTGRES_PASSWORD', 'POSTGRES_PASSWORD_FILE');
const POSTGRES_DB = getEnvValue('POSTGRES_DB', 'POSTGRES_DB_FILE');
const POSTGRES_HOST = getEnvValue('POSTGRES_HOST', 'POSTGRES_HOST_FILE');
const POSTGRES_PORT = getEnvValue('POSTGRES_PORT', 'POSTGRES_PORT_FILE');

export const pool = new Pool({
    host: POSTGRES_HOST,
    port: parseInt(POSTGRES_PORT!, 10),
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,    
});
