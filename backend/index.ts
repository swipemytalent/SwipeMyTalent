import { loginHandler } from './handlers/login.js';
import { getUserConversations, getConversationMessages, markConversationAsRead } from './handlers/conversations.js';
import { profileHandler, updateProfileHandler } from './handlers/profile.js';
import { registerHandler } from './handlers/register.js';
import { getAllUsersHandler, getUserByIdHandler, getUserRatingsHandler } from './handlers/users.js';
import { rateProfileHandler } from './handlers/rateProfile.js';
import { unsubscribeHandler } from './handlers/unsubscribe.js';
import { createExchangeHandler, confirmExchangeHandler, completeExchangeHandler, getUserExchangesHandler, getExchangeRatingHandler } from './handlers/exchanges.js';
import { getAllowedOrigins } from './utils/origins.js';
import { sendMessage } from './handlers/messages.js';
import { deleteUnsubcribedUsers } from './jobs/deleteUnsubscribedUsers.js';

import cors from 'cors';
import cron from 'node-cron';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import { CorsOptions } from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import webpush from 'web-push';

dotenv.config();
webpush.setVapidDetails(
    'mailto:no-reply@swipemytalent.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

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
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.post("/register", registerHandler);
app.post("/login", loginHandler);
app.get("/profile", profileHandler);
app.put("/profile", updateProfileHandler);

app.get('/conversations/:userId', getUserConversations as express.RequestHandler);
app.get('/conversations/:conversationId/messages', getConversationMessages as express.RequestHandler);
app.put('/conversations/:conversationId/read', markConversationAsRead as express.RequestHandler);

app.get('/users', getAllUsersHandler);
app.get('/users/:id', getUserByIdHandler);
app.get('/users/:id/ratings', getUserRatingsHandler as express.RequestHandler);
app.post('/rate/:userId', rateProfileHandler as express.RequestHandler);
app.delete('/unsubscribe', unsubscribeHandler);

app.post('/exchanges', createExchangeHandler as express.RequestHandler);
app.put('/exchanges/:id/confirm', confirmExchangeHandler as express.RequestHandler);
app.put('/exchanges/:id/complete', completeExchangeHandler as express.RequestHandler);
app.get('/exchanges', getUserExchangesHandler as express.RequestHandler);
app.get('/exchanges/:id/rating', getExchangeRatingHandler as express.RequestHandler);

app.post('/messages', sendMessage as express.RequestHandler);

const server = createServer(app);
const io = new SocketIOServer(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});
const connectedUsers = new Map<string, string>();


app.set('io', io);
app.set('connectedUsers', connectedUsers);

io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    socket.on('register', (userId: string) => {
        connectedUsers.set(userId, socket.id)
        console.log(`✅ Registered user ${userId} with socket ${socket.id}`);
    });
    socket.on('disconnect', () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);

                break;
            }
        }
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

server.listen(port, () => {
    console.log(`🚀 Server listening on http://localhost:${port}`);
});

cron.schedule('0 0 * * *', () => {
    console.log('🕛 Running scheduled cleanup for unsubscribed users...');

    deleteUnsubcribedUsers();
});
