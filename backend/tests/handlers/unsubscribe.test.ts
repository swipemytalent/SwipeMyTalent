import { unsubscribeHandler } from '../../src/handlers/unsubscribe';
import { pool } from '../../src/db/pool';

jest.mock('../../src/db/pool', () => ({
    pool: {
        query: jest.fn()
    }
}));

const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('unsubscribe', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email is missing', async () => {
        const req: any = { body: {} };
        const res = mockRes();

        await unsubscribeHandler(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Email is required to unsubscribe'
        });
    });

    it('should return 404 if user not found', async () => {
        const req: any = { body: { email: 'notfound@example.com' } };
        const res = mockRes();

        (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

        await unsubscribeHandler(req, res, jest.fn());

        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE users SET subscribed = FALSE, unsubscribed_at = NOW() WHERE email = $1 RETURNING *',
            ['notfound@example.com']
        );
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found.' });
    });

    it('should unsubscribe user and return 200', async () => {
        const req: any = { body: { email: 'user@example.com' } };
        const res = mockRes();

        (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1, rows: [{}] });

        await unsubscribeHandler(req, res, jest.fn());

        expect(pool.query).toHaveBeenCalledWith(
            'UPDATE users SET subscribed = FALSE, unsubscribed_at = NOW() WHERE email = $1 RETURNING *',
            ['user@example.com']
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'You have been unsubscribed. Your account will be deleted after 14 days.'
        });
    });

    it('should return 500 on query error', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        const req: any = { body: { email: 'user@example.com' } };
        const res = mockRes();

        (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

        await unsubscribeHandler(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error.' });

        console.error = originalError;
    });
});

