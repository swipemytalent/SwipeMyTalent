import { loginHandler } from './handlers/login.js';
import { getMessages, sendMessage } from './handlers/messages.js';
import { profileHandler, updateProfileHandler } from './handlers/profile.js';
import { registerHandler } from './handlers/register.js';
import { getAllUsersHandler } from './handlers/users.js';
import { getAllowedOrigins } from './utils/origins.js';

import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import { CorsOptions } from 'cors';

dotenv.config();

const app: Express = express();
const port: number = 5000;
const allowedOrigins = getAllowedOrigins();
const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not authorized by CORS"), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization'
    ],
    maxAge: 86400
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.post("/register", registerHandler);
app.post("/login", loginHandler);
app.get("/profile", profileHandler);
app.put("/profile", updateProfileHandler);
app.get('/messages/:userId', getMessages);
app.post('/messages', sendMessage);
app.get('/users', getAllUsersHandler);

app.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
});
