import {
    getUserNotificationsHandler,
    markNotificationAsReadHandler,
    markAllNotificationsAsReadHandler,
    deleteNotificationHandler
} from '../../src/handlers/notifications';

import { pool } from '../../src/db/pool';
import jwt from 'jsonwebtoken';

jest.mock('../../src/db/pool', () => ({
    pool: {
        query: jest.fn()
    }
}));

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

jest.mock('../../src/utils/getEnv', () => ({
    getEnvValue: jest.fn().mockReturnValue('test_key')
}));

const createMockRes = () => {
    const res: any = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

describe('notifications', () => {
    const mockUserId = 123;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserNotificationsHandler', () => {
        it('returns 401 if token is missing', async () => {
            const req: any = { headers: {} };
            const res = createMockRes();

            await getUserNotificationsHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant.' });
        });

        it('returns notifications for valid user', async () => {
            const mockRows = [{ id: 1, type: 'test', payload: {}, is_read: false, created_at: 'now' }];
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
            (pool.query as jest.Mock).mockResolvedValue({ rows: mockRows });

            const req: any = { headers: { authorization: 'Bearer token' } };
            const res = createMockRes();

            await getUserNotificationsHandler(req, res, jest.fn());

            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserId]);
            expect(res.json).toHaveBeenCalledWith(mockRows);
        });
    });

    describe('markNotificationAsReadHandler', () => {
        it('returns 400 if notification ID is invalid', async () => {
            const req: any = {
                headers: { authorization: 'Bearer token' },
                params: { id: 'not-a-number' }
            };
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
            const res = createMockRes();

            await markNotificationAsReadHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'ID de notification requis.' });
        });

        it('returns 404 if notification not found', async () => {
            const req: any = {
                headers: { authorization: 'Bearer token' },
                params: { id: '10' }
            };
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
            (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });
            const res = createMockRes();

            await markNotificationAsReadHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Notification non trouvée.' });
        });

        it('marks notification as read', async () => {
            const req: any = {
                headers: { authorization: 'Bearer token' },
                params: { id: '5' }
            };
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
            (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });
            const res = createMockRes();

            await markNotificationAsReadHandler(req, res, jest.fn());

            expect(res.json).toHaveBeenCalledWith({ message: 'Notification marquée comme lue.' });
        });
    });

    describe('markAllNotificationsAsReadHandler', () => {
        it('returns 401 if token is missing', async () => {
            const req: any = { headers: {} };
            const res = createMockRes();

            await markAllNotificationsAsReadHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant.' });
        });

        it('marks all notifications as read', async () => {
            const req: any = { headers: { authorization: 'Bearer token' } };
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
            const res = createMockRes();

            await markAllNotificationsAsReadHandler(req, res, jest.fn());

            expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE notifications'), [mockUserId]);
            expect(res.json).toHaveBeenCalledWith({ message: 'Toutes les notifications ont été marquées comme lues.' });
        });
    });

    describe('deleteNotificationHandler', () => {
        it('returns 400 if notification ID is invalid', async () => {
            const req: any = {
                headers: { authorization: 'Bearer token' },
                params: { id: 'NaN' }
            };
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
            const res = createMockRes();

            await deleteNotificationHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'ID de notification requis.' });
        });

        it('returns 404 if notification not found', async () => {
            const req: any = {
                headers: { authorization: 'Bearer token' },
                params: { id: '9' }
            };
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
            (pool.query as jest.Mock).mockResolvedValue({ rowCount: 0 });
            const res = createMockRes();

            await deleteNotificationHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Notification non trouvée.' });
        });

        it('deletes a notification', async () => {
            const req: any = {
                headers: { authorization: 'Bearer token' },
                params: { id: '7' }
            };
            (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
            (pool.query as jest.Mock).mockResolvedValue({ rowCount: 1 });
            const res = createMockRes();

            await deleteNotificationHandler(req, res, jest.fn());

            expect(res.json).toHaveBeenCalledWith({ message: 'Notification supprimée.' });
        });
    });
});

