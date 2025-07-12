import { createExchangeHandler, confirmExchangeHandler } from '../../src/handlers/exchanges';
import { pool } from '../../src/db/pool';
import jwt from 'jsonwebtoken';
import { sendPushNotification } from '../../src/utils/sendPushNotification';

jest.mock('../../src/db/pool', () => ({
    pool: {
        query: jest.fn()
    }
}));

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

jest.mock('../../src/utils/sendPushNotification', () => ({
    sendPushNotification: jest.fn()
}));

jest.mock('../../src/utils/getEnv', () => ({
    getEnvValue: jest.fn().mockReturnValue('test_key')
}));

const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('exchanges', () => {
    const mockUserId = 42;
    const mockToken = 'Bearer test.token';
    const decodedToken = { id: mockUserId, email: 'user@test.com' };
    const connectedUsers = new Map();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createExchangeHandler', () => {
        const validReq: any = {
            headers: { authorization: mockToken },
            app: { get: () => connectedUsers },
            body: {
                recipient_id: 99,
                description: 'Let\'s trade skills'
            }
        };

        it('should return 401 when no token', async () => {
            const req: any = {
                headers: {},
                app: {
                    get: jest.fn().mockReturnValue(new Map())
                }
            };
            const res = mockRes();
            await createExchangeHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 400 if exchanging with self', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: 99, email: 'self@test.com' });
            const req = { ...validReq, body: { recipient_id: 99, description: 'yo' } };
            const res = mockRes();

            await createExchangeHandler(req as any, res, jest.fn());
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if recipient not found', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const res = mockRes();
            await createExchangeHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should create exchange and notify recipient', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

            (pool.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [{ id: 99 }] })
                .mockResolvedValueOnce({ rows: [{ id: 1, initiator_id: mockUserId, recipient_id: 99, description: 'Let\'s trade skills', status: 'pending', initiator_confirmed: false, recipient_confirmed: false, created_at: new Date() }] })
                .mockResolvedValueOnce({ rows: [{ first_name: 'Jane', last_name: 'Doe' }] })
                .mockResolvedValueOnce({});

            const res = mockRes();

            await createExchangeHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(201);
            expect(sendPushNotification).toHaveBeenCalled();
        });
    });

    describe('confirmExchangeHandler', () => {
        const req: any = {
            headers: { authorization: mockToken },
            params: { id: '123' },
            app: { get: () => connectedUsers }
        };

        const fakeExchange = {
            id: 123,
            initiator_id: mockUserId,
            recipient_id: 99,
            status: 'pending',
            initiator_confirmed: false,
            recipient_confirmed: true
        };

        it('should return 403 if user is not part of the exchange', async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: 999 });
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [fakeExchange] });

            const res = mockRes();
            await confirmExchangeHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should return 400 if exchange is completed', async () => {
            const completedExchange = { ...fakeExchange, status: 'completed', initiator_id: mockUserId };
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [completedExchange] });

            const res = mockRes();
            await confirmExchangeHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should confirm and notify if both parties confirmed', async () => {
            const halfConfirmed = {
                ...fakeExchange,
                initiator_confirmed: false,
                recipient_confirmed: true,
                initiator_id: mockUserId
            };

            const confirmed = {
                ...halfConfirmed,
                initiator_confirmed: true,
                recipient_confirmed: true
            };

            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

            (pool.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [halfConfirmed] })
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ rows: [confirmed] })
                .mockResolvedValueOnce({})
                .mockResolvedValueOnce({ rows: [{ first_name: 'You', last_name: 'Confirmed' }] })
                .mockResolvedValueOnce({});

            const res = mockRes();
            await confirmExchangeHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(200);
            expect(sendPushNotification).toHaveBeenCalled();
        });
    });
});

