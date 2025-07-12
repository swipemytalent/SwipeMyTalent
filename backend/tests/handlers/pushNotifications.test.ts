import { getVapidPublicKeyHandler, subscribeToPushHandler, unsubscribeFromPushHandler } from '../../src/handlers/pushNotifications';
import { pool } from '../../src/db/pool';
import jwt from 'jsonwebtoken';

jest.mock('../../src/db/pool', () => ({
    pool: {
        query: jest.fn(),
    },
}));

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn(),
}));

jest.mock('../../src/utils/getEnv', () => ({
    getEnvValue: jest.fn(() => 'mocked'),
}));

describe('pushNotifications', () => {
    const mockRes = () => {
        const res: any = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getVapidPublicKeyHandler', () => {
        it('should respond with 500 if VAPID_PUBLIC_KEY not set', async () => {
            const originalError = console.error;
            console.error = jest.fn();

            process.env.VAPID_PUBLIC_KEY = '';
            const req = {};
            const res = mockRes();

            await getVapidPublicKeyHandler(req as any, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Clé VAPID non configurée.' });

            console.error = originalError;
        });

        it('should send the VAPID_PUBLIC_KEY if set', async () => {
            process.env.VAPID_PUBLIC_KEY = 'test-vapid-key';
            const req = {};
            const res = mockRes();

            await getVapidPublicKeyHandler(req as any, res, jest.fn());

            expect(res.send).toHaveBeenCalledWith('test-vapid-key');
        });
    });

    describe('subscribeToPushHandler', () => {
        const mockUserId = 42;
        const validToken = 'valid.token';
        const subscriptionObj = { endpoint: 'https://example.com/endpoint', keys: { p256dh: 'key', auth: 'auth' } };

        const authHeader = `Bearer ${validToken}`;

        it('should return 401 if no token or malformed', async () => {
            const req = { headers: {} };
            const res = mockRes();

            await subscribeToPushHandler(req as any, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant.' });
        });

        it('should return 400 if no subscription in body', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId, email: 'user@example.com' });

            const req = { headers: { authorization: authHeader }, body: {} };
            const res = mockRes();

            await subscribeToPushHandler(req as any, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Subscription requise.' });
        });

        it('should return 404 if user not found or not subscribed', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId, email: 'user@example.com' });
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const req = { headers: { authorization: authHeader }, body: { subscription: subscriptionObj } };
            const res = mockRes();

            await subscribeToPushHandler(req as any, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé ou compte désactivé.' });
        });

        it('should delete existing subscriptions and insert new subscription', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId, email: 'user@example.com' });
            (pool.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [{ id: mockUserId }] }) // userCheck
                .mockResolvedValueOnce({}) // delete existing
                .mockResolvedValueOnce({}); // insert new

            const req = { headers: { authorization: authHeader }, body: { subscription: subscriptionObj } };
            const res = mockRes();

            await subscribeToPushHandler(req as any, res, jest.fn());

            expect(pool.query).toHaveBeenNthCalledWith(1,
                'SELECT id FROM users WHERE id = $1 AND subscribed = TRUE',
                [mockUserId]
            );
            expect(pool.query).toHaveBeenNthCalledWith(2,
                'DELETE FROM push_subscriptions WHERE user_id = $1',
                [mockUserId]
            );
            expect(pool.query).toHaveBeenNthCalledWith(3,
                expect.stringContaining('INSERT INTO push_subscriptions'),
                [mockUserId, JSON.stringify(subscriptionObj)]
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Abonnement aux notifications réussi.' });
        });

        it('should handle errors and respond with 500', async () => {
            const originalError = console.error;
            console.error = jest.fn();

            (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('jwt error'); });

            const req = { headers: { authorization: authHeader }, body: { subscription: subscriptionObj } };
            const res = mockRes();

            await subscribeToPushHandler(req as any, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Une erreur est survenue lors de l'abonnement aux notifications."
            });

            console.error = originalError;
        });
    });

    describe('unsubscribeFromPushHandler', () => {
        const mockUserId = 55;
        const validToken = 'valid.token';
        const authHeader = `Bearer ${validToken}`;

        it('should return 401 if no token or malformed', async () => {
            const req = { headers: {} };
            const res = mockRes();

            await unsubscribeFromPushHandler(req as any, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant.' });
        });

        it('should delete push subscription for user and respond success', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId, email: 'user@example.com' });
            (pool.query as jest.Mock).mockResolvedValue({});

            const req = { headers: { authorization: authHeader } };
            const res = mockRes();

            await unsubscribeFromPushHandler(req as any, res, jest.fn());

            expect(pool.query).toHaveBeenCalledWith(
                'DELETE FROM push_subscriptions WHERE user_id = $1',
                [mockUserId]
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Désabonnement des notifications réussi.' });
        });

        it('should handle errors and respond with 500', async () => {
            const originalError = console.error;
            console.error = jest.fn();

            (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('jwt error'); });

            const req = { headers: { authorization: authHeader } };
            const res = mockRes();

            await unsubscribeFromPushHandler(req as any, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Une erreur est survenue lors du désabonnement des notifications.'
            });

            console.error = originalError;
        });
    });
});

