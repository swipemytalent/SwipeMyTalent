import { pool } from '../db/pool';

import { Request, Response, NextFunction } from 'express';

export async function getUserConversations(req: Request, res: Response, _next: NextFunction) {
    const userId = Number(req.params.userId);

    try {
        const conversationsQuery = `
            WITH conversation_pairs AS (
                SELECT 
                    CASE 
                        WHEN sender_id = $1 THEN receiver_id 
                        ELSE sender_id 
                    END as other_user_id,
                    MAX(sent_at) as last_message_time
                FROM messages 
                WHERE sender_id = $1 OR receiver_id = $1
                GROUP BY other_user_id
            ),
            last_messages AS (
                SELECT DISTINCT ON (conversation_pairs.other_user_id)
                    conversation_pairs.other_user_id,
                    m.content as last_message_content,
                    m.sent_at as last_message_time,
                    m.sender_id = $1 as is_from_me,
                    m.is_read
                FROM conversation_pairs
                JOIN messages m ON (
                    (m.sender_id = $1 AND m.receiver_id = conversation_pairs.other_user_id) OR
                    (m.sender_id = conversation_pairs.other_user_id AND m.receiver_id = $1)
                )
                WHERE m.sent_at = conversation_pairs.last_message_time
                ORDER BY conversation_pairs.other_user_id, m.sent_at DESC
            ),
            unread_counts AS (
                SELECT 
                    sender_id as other_user_id,
                    COUNT(*) as unread_count
                FROM messages 
                WHERE receiver_id = $1 AND is_read = false
                GROUP BY sender_id
            )
            SELECT 
                u.id as participant_id,
                u.first_name as participant_first_name,
                u.last_name as participant_last_name,
                u.avatar as participant_avatar,
                u.title as participant_title,
                lm.last_message_content,
                lm.last_message_time,
                lm.is_from_me,
                COALESCE(uc.unread_count, 0) as unread_count
            FROM last_messages lm
            JOIN users u ON u.id = lm.other_user_id
            LEFT JOIN unread_counts uc ON uc.other_user_id = lm.other_user_id
            WHERE u.subscribed = true
            ORDER BY lm.last_message_time DESC
        `;
        const result = await pool.query(conversationsQuery, [userId]);
        const conversations = result.rows.map(row => ({
            id: `conv_${userId}_${row.participant_id}`,
            participant: {
                id: row.participant_id.toString(),
                firstName: row.participant_first_name,
                lastName: row.participant_last_name,
                avatar: row.participant_avatar,
                title: row.participant_title
            },
            lastMessage: {
                content: row.last_message_content,
                timestamp: row.last_message_time,
                isFromMe: row.is_from_me
            },
            unreadCount: row.unread_count
        }));

        res.json(conversations);
    } catch (err) {
        console.error('Erreur lors de la récupération des conversations:', err);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des conversations.' });
    }
}

export async function getConversationMessages(req: Request, res: Response, _next: NextFunction) {
    const conversationId = req.params.conversationId;

    try {
        const match = conversationId.match(/conv_(\d+)_(\d+)/);
        if (!match) {
            res.status(400).json({ message: 'ID de conversation invalide.' });

            return;
        }

        const [, user1Id, user2Id] = match;
        const userId1 = Number(user1Id);
        const userId2 = Number(user2Id);
        const messagesQuery = `
            SELECT 
                m.id,
                m.sender_id,
                m.receiver_id,
                m.content,
                m.sent_at,
                m.is_read,
                sender.first_name as sender_first_name,
                sender.last_name as sender_last_name,
                receiver.first_name as receiver_first_name,
                receiver.last_name as receiver_last_name
            FROM messages m
            JOIN users sender ON m.sender_id = sender.id
            JOIN users receiver ON m.receiver_id = receiver.id
            WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
               OR (m.sender_id = $2 AND m.receiver_id = $1)
            ORDER BY m.sent_at ASC
        `;
        const result = await pool.query(messagesQuery, [userId1, userId2]);
        const messages = result.rows.map(row => ({
            id: row.id.toString(),
            senderId: row.sender_id.toString(),
            receiverId: row.receiver_id.toString(),
            content: row.content,
            timestamp: row.sent_at,
            senderName: `${row.sender_first_name} ${row.sender_last_name}`,
            receiverName: `${row.receiver_first_name} ${row.receiver_last_name}`
        }));

        res.json(messages);
    } catch (err) {
        console.error('Erreur lors de la récupération des messages:', err);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages.' });
    }
}

export async function markConversationAsRead(req: Request, res: Response, _next: NextFunction) {
    const conversationId = req.params.conversationId;

    try {
        const match = conversationId.match(/conv_(\d+)_(\d+)/);
        if (!match) {
            res.status(400).json({ message: 'ID de conversation invalide.' });

            return;
        }

        const [, user1Id, user2Id] = match;
        const userId1 = Number(user1Id);
        const userId2 = Number(user2Id);
        const updateQuery = `
            UPDATE messages 
            SET is_read = true 
            WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
        `;

        await pool.query(updateQuery, [userId2, userId1]);

        res.status(200).json({ message: 'Conversation marquée comme lue.' });
    } catch (err) {
        console.error('Erreur lors du marquage de la conversation:', err);
        res.status(500).json({ message: 'Erreur serveur lors du marquage de la conversation.' });
    }
} 
