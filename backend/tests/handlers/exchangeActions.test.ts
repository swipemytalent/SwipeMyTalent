import { completeExchangeHandler, getUserExchangesHandler, getExchangeRatingHandler } from '../../src/handlers/exchangeActions';
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

describe('exchangeActions', () => {
    const mockUserId = 123;
    const mockToken = 'Bearer test.token';
    const decodedToken = { id: mockUserId, email: 'user@test.com' };
    const connectedUsers = new Map();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('completeExchangeHandler', () => {
        const validReq: any = {
            headers: { authorization: mockToken },
            app: { get: () => connectedUsers },
            params: { id: '123' }
        };

        it('should return 401 if no token', async () => {
            const req: any = { headers: {}, app: { get: () => new Map() }, params: { id: '1' } };
            const res = mockRes();

            await completeExchangeHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 400 if no exchange id', async () => {
            const req: any = { ...validReq, params: { id: '0' } };
            const res = mockRes();

            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

            await completeExchangeHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 404 if exchange not found', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const res = mockRes();
            await completeExchangeHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 403 if user not part of exchange', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock).mockResolvedValueOnce({
                rows: [{ initiator_id: 1, recipient_id: 2, status: 'confirmed' }]
            });

            const res = mockRes();
            await completeExchangeHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should return 400 if exchange not confirmed', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock).mockResolvedValueOnce({
                rows: [{ initiator_id: mockUserId, recipient_id: 2, status: 'pending' }]
            });

            const res = mockRes();
            await completeExchangeHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should complete exchange and notify other user', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

            (pool.query as jest.Mock).mockImplementation((query: string, params: any[]) => {
                if (query.includes('SELECT * FROM exchanges WHERE id =')) {
                    return Promise.resolve({
                        rows: [{ initiator_id: mockUserId, recipient_id: 99, status: 'confirmed' }]
                    });
                }
                if (query.startsWith('UPDATE exchanges SET status =')) {
                    return Promise.resolve({ rowCount: 1 });
                }
                if (query.includes('SELECT first_name, last_name FROM users WHERE id =')) {
                    if (params[0] === 99) {
                        return Promise.resolve({ rows: [{ first_name: 'Jane', last_name: 'Smith' }] });
                    }
                    if (params[0] === mockUserId) {
                        return Promise.resolve({ rows: [{ first_name: 'John', last_name: 'Doe' }] });
                    }
                    return Promise.resolve({ rows: [] });
                }
                if (query.includes('INSERT INTO notifications')) {
                    return Promise.resolve({ rowCount: 1 });
                }
                return Promise.resolve({ rows: [] });
            });

            const res = mockRes();
            await completeExchangeHandler(validReq, res, jest.fn());

            expect(pool.query).toHaveBeenCalledWith(
                expect.stringMatching(/UPDATE exchanges\s+SET\s+status = 'completed'(, completed_at = CURRENT_TIMESTAMP)?\s+WHERE id = \$1/),
                [123]
            );
            expect(sendPushNotification).toHaveBeenCalledWith(
                99,
                expect.objectContaining({ title: 'Échange terminé' }),
                connectedUsers
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.any(String), exchange_id: 123 })
            );
        });
    });

    describe('getUserExchangesHandler', () => {
        const req: any = {
            headers: { authorization: mockToken }
        };

        it('should return 401 if no token', async () => {
            const reqNoToken: any = { headers: {} };
            const res = mockRes();

            await getUserExchangesHandler(reqNoToken, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return exchanges list', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        description: 'Test exchange',
                        status: 'pending',
                        initiator_confirmed: true,
                        recipient_confirmed: false,
                        created_at: new Date(),
                        completed_at: null,
                        initiator_id: mockUserId,
                        initiator_first_name: 'John',
                        initiator_last_name: 'Doe',
                        initiator_avatar: 'avatar1.png',
                        initiator_title: 'Developer',
                        recipient_id: 2,
                        recipient_first_name: 'Jane',
                        recipient_last_name: 'Smith',
                        recipient_avatar: 'avatar2.png',
                        recipient_title: 'Designer'
                    }
                ]
            });

            const res = mockRes();

            await getUserExchangesHandler(req, res, jest.fn());

            expect(res.json).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 1,
                        description: 'Test exchange',
                        initiator: expect.objectContaining({ firstName: 'John', lastName: 'Doe' }),
                        recipient: expect.objectContaining({ firstName: 'Jane', lastName: 'Smith' }),
                        isInitiator: true
                    })
                ])
            );
        });
    });

    describe('getExchangeRatingHandler', () => {
        const validReq: any = {
            headers: { authorization: mockToken },
            params: { id: '456' }
        };

        it('should return 401 if no token', async () => {
            const reqNoToken: any = { headers: {}, params: { id: '1' } };
            const res = mockRes();

            await getExchangeRatingHandler(reqNoToken, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should return 400 if no exchange id', async () => {
            const req: any = { headers: { authorization: mockToken }, params: { id: '0' } };
            const res = mockRes();

            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

            await getExchangeRatingHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return null if no rating found', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [{ id: 456, initiator_id: mockUserId, recipient_id: 2 }] }) // exchange exists
                .mockResolvedValueOnce({ rows: [] }); // no rating found

            const res = mockRes();
            await getExchangeRatingHandler(validReq, res, jest.fn());

            expect(res.json).toHaveBeenCalledWith(null);
        });

        it('should return rating if found', async () => {
            const rating = { id: 1, rating: 5, comment: 'Great!' };
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [{ id: 456, initiator_id: mockUserId, recipient_id: 2 }] }) // exchange exists
                .mockResolvedValueOnce({ rows: [rating] }); // rating found

            const res = mockRes();
            await getExchangeRatingHandler(validReq, res, jest.fn());

            expect(res.json).toHaveBeenCalledWith(rating);
        });
    });
});

