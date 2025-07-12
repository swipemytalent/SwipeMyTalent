import { loginHandler } from './handlers/login';
import { getUserConversations, getConversationMessages, markConversationAsRead } from './handlers/conversations';
import { profileHandler, updateProfileHandler } from './handlers/profile';
import { registerHandler } from './handlers/register';
import { getAllUsersHandler, getUserByIdHandler, getUserRatingsHandler } from './handlers/users';
import { rateProfileHandler } from './handlers/rateProfile';
import { unsubscribeHandler } from './handlers/unsubscribe';
import { createExchangeHandler, confirmExchangeHandler } from './handlers/exchanges';
import { completeExchangeHandler, getUserExchangesHandler, getExchangeRatingHandler } from './handlers/exchangeActions';
import { getAllowedOrigins } from './utils/origins';
import { sendMessage } from './handlers/messages';
import { deleteUnsubcribedUsers } from './jobs/deleteUnsubscribedUsers';
import { getUserNotificationsHandler, markNotificationAsReadHandler, markAllNotificationsAsReadHandler, deleteNotificationHandler } from './handlers/notifications';
import { getVapidPublicKeyHandler, subscribeToPushHandler, unsubscribeFromPushHandler } from './handlers/pushNotifications';
import { getAllForumsHandler, getForumByIdHandler, createTopicHandler, getTopicByIdHandler, createPostHandler } from './handlers/forums';

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

app.get('/conversations/:userId', getUserConversations);
app.get('/conversations/:conversationId/messages', getConversationMessages);
app.put('/conversations/:conversationId/read', markConversationAsRead);

app.get('/users', getAllUsersHandler);
app.get('/users/:id', getUserByIdHandler);
app.get('/users/:id/ratings', getUserRatingsHandler);
app.post('/rate/:userId', rateProfileHandler);
app.delete('/unsubscribe', unsubscribeHandler);

app.post('/exchanges', createExchangeHandler);
app.put('/exchanges/:id/confirm', confirmExchangeHandler);
app.put('/exchanges/:id/complete', completeExchangeHandler);
app.get('/exchanges', getUserExchangesHandler);
app.get('/exchanges/:id/rating', getExchangeRatingHandler);

app.post('/messages', sendMessage);

app.get('/notifications', getUserNotificationsHandler);
app.put('/notifications/:id/read', markNotificationAsReadHandler);
app.put('/notifications/read-all', markAllNotificationsAsReadHandler);
app.delete('/notifications/:id', deleteNotificationHandler);

app.get('/push/vapid-public-key', getVapidPublicKeyHandler);
app.post('/push/subscribe', subscribeToPushHandler);
app.post('/push/unsubscribe', unsubscribeFromPushHandler);

app.get('/forums', getAllForumsHandler as express.RequestHandler);
app.get('/forums/:id', getForumByIdHandler as express.RequestHandler);
app.post('/topics', createTopicHandler as express.RequestHandler);
app.get('/topics/:id', getTopicByIdHandler as express.RequestHandler);
app.post('/posts', createPostHandler as express.RequestHandler);

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
