import { pool } from '../db/pool.js';
import { Message } from '../types/Message.js';
import { formatDate } from '../utils/date.js';

import { Request, Response } from 'express';
import webpush from 'web-push';
import { sendPushNotification } from '../utils/sendPushNotification.js';

export async function getMessages(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const result = await pool.query(
        `SELECT m.*, u.first_name AS sender_first_name, u.last_name AS sender_last_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.receiver_id = $1
         ORDER BY m.sent_at DESC`,
        [userId]
    );
    const formattedMessages = result.rows.map((msg) => ({
        ...msg,
        sent_at_pretty: formatDate(msg.sent_at),
        sent_at_relative: formatDate(msg.sent_at, 'relative'),
    }));

    res.json(formattedMessages);
}

export async function sendMessage(req: Request, res: Response) {
    const { sender_id, receiver_id, content } = req.body;
    const result = await pool.query<Message>(
        `INSERT INTO messages (sender_id, receiver_id, content)
         VALUES ($1, $2, $3) RETURNING *`,
        [sender_id, receiver_id, content]
    );
    const message = result.rows[0];
    const enrichedMessage = {
        ...message,
        sent_at_pretty: formatDate(message.sent_at),
        sent_at_relative: formatDate(message.sent_at, 'relative'),
    };

    const sender = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [sender_id]);
    const senderName = sender.rows[0] ? `${sender.rows[0].first_name} ${sender.rows[0].last_name}` : 'Quelqu\'un';

    await pool.query(
        `INSERT INTO notifications (user_id, type, payload)
         VALUES ($1, $2, $3)`,
        [receiver_id, 'message', {
            sender_id,
            sender_name: senderName,
            message_id: message.id,
            preview: content.slice(0, 100)
        }]
    );

    const io = req.app.get('io');
    const connectedUsers: Map<string, string> = req.app.get('connectedUsers');
    const socketId = connectedUsers.get(receiver_id.toString());
    if (socketId) {
        io.to(socketId).emit('new_message', enrichedMessage);
    }

    await sendPushNotification(
        receiver_id,
        {
            title: 'Nouveau message',
            body: content.length > 80 ? content.slice(0, 80) + '…' : content
        },
        connectedUsers
    );

    res.status(201).json(enrichedMessage);
}
