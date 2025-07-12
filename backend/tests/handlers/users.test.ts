import {
    getAllUsersHandler,
    getUserByIdHandler,
    getUserRatingsHandler
} from '../../src/handlers/users';
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

const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('users', () => {
    const mockUserId = 42;
    const mockToken = 'Bearer test.token';
    const decodedToken = { id: mockUserId, email: 'user@test.com' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsersHandler', () => {
        const validReq: any = {
            headers: { authorization: mockToken }
        };

        it('should return 401 when no token', async () => {
            const req: any = {
                headers: {}
            };
            const res = mockRes();

            await getAllUsersHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant.' });
        });

        it('should return users list', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

            (pool.query as jest.Mock).mockResolvedValue({
                rows: [
                    {
                        id: 2,
                        email: 'user2@example.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        title: 'Developer',
                        avatar: null,
                        bio: null,
                        averageRating: 4.5
                    }
                ]
            });

            const res = mockRes();

            await getAllUsersHandler(validReq, res, jest.fn());

            expect(res.status).not.toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.any(Array));
        });

        it('should return 500 on query error', async () => {
            const originalError = console.error;
            console.error = jest.fn();

            (jwt.verify as jest.Mock).mockReturnValue(decodedToken);
            (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = mockRes();

            await getAllUsersHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur.' });

            console.error = originalError;
        });
    });

    describe('getUserByIdHandler', () => {
        const validReq: any = {
            params: { id: '2' }
        };

        it('should return 404 if user not found', async () => {
            (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

            const res = mockRes();

            await getUserByIdHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé.' });
        });

        it('should return user by id', async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [
                    {
                        id: 2,
                        email: 'user2@example.com',
                        firstName: 'Jane',
                        lastName: 'Smith',
                        title: 'Designer',
                        avatar: null,
                        bio: null,
                        averageRating: 4.2
                    }
                ]
            });

            const res = mockRes();

            await getUserByIdHandler(validReq, res, jest.fn());

            expect(res.status).not.toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 2, firstName: 'Jane' }));
        });

        it('should return 500 on query error', async () => {
            const originalError = console.error;
            console.error = jest.fn();

            (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = mockRes();

            await getUserByIdHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur.' });

            console.error = originalError;
        });
    });

    describe('getUserRatingsHandler', () => {
        const validReq: any = {
            params: { id: '2' }
        };

        it('should return ratings list', async () => {
            (pool.query as jest.Mock).mockResolvedValue({
                rows: [
                    {
                        id: 1,
                        rated_user_id: 2,
                        rating: 5,
                        comment: 'Great work!',
                        raterFirstName: 'Bob',
                        raterLastName: 'Lee',
                        created_at: new Date()
                    }
                ]
            });

            const res = mockRes();

            await getUserRatingsHandler(validReq, res, jest.fn());

            expect(res.status).not.toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.any(Array));
        });

        it('should return 500 on query error', async () => {
            const originalError = console.error;
            console.error = jest.fn();

            (pool.query as jest.Mock).mockRejectedValue(new Error('DB error'));

            const res = mockRes();

            await getUserRatingsHandler(validReq, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Erreur serveur.' });

            console.error = originalError;
        });
    });
});

