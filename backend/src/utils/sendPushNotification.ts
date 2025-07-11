import { pool } from '../db/pool';

import webpush from 'web-push';

export async function sendPushNotification(
    userId: number,
    payload: any,
    connectedUsers: Map<string, string>
) {
    try {
        const isOnline = connectedUsers.has(userId.toString());

        if (!isOnline) {
            const result = await pool.query(
                `SELECT subscription FROM push_subscriptions WHERE user_id = $1`,
                [userId]
            );

            if (result.rows.length > 0) {
                const subscription = result.rows[0].subscription;

                await webpush.sendNotification(
                    subscription,
                    JSON.stringify(payload)
                );
            }
        }
    } catch (err) {
        console.error('❌ Failed to send push notification:', err);
    }
}
