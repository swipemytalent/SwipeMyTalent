import { pool } from "../db/pool";

export const deleteUnsubcribedUsers = async () => {
    try {
        const result = await pool.query(`
            DELETE FROM users
            WHERE subscribed = FALSE
            AND unsubscribed_at IS NOT NULL
            AND unsubscribed_at < NOW() - INTERVAL '14 days'
        `);

        
    } catch (error) {
        
    }
};
