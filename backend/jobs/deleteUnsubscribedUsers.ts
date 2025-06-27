import { pool } from "../db/pool.js";

export const deleteUnsubcribedUsers = async () => {
    try {
        const result = await pool.query(`
            DELETE FROM users
            WHERE subscribed = FALSE
            AND unsubscribed_at IS NOT NULL
            AND unsubscribed_at < NOW() - INTERVAL '14 days'
        `);

        console.log(`✅ Deleted ${result.rowCount} old unsubscribed users`);
    } catch (error) {
        console.error('❌ Error deleting unsubscribed users:', error);
    }
};
