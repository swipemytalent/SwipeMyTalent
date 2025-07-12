import { profileHandler, updateProfileHandler } from '../../src/handlers/profile';
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

describe('profile', () => {
    const mockUserId = 101;
    const mockToken = 'Bearer fake.token.value';
    const mockDecoded = { id: mockUserId, email: 'user@example.com' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('profileHandler', () => {
        it('returns 401 if token is missing', async () => {
            const req: any = { headers: {} };
            const res = createMockRes();

            await profileHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant.' });
        });

        it('returns 404 if user not found', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
            (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

            const req: any = { headers: { authorization: mockToken } };
            const res = createMockRes();

            await profileHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non trouvé.' });
        });

        it('returns user profile with average rating', async () => {
            const profileRow = {
                id: mockUserId,
                email: mockDecoded.email,
                firstName: 'Jane',
                lastName: 'Doe',
                title: 'Engineer',
                avatar: 'avatar.png',
                bio: 'Hello world'
            };

            const avgRating = { averageRating: 4.2 };

            (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
            (pool.query as jest.Mock)
                .mockResolvedValueOnce({ rows: [profileRow] }) // user
                .mockResolvedValueOnce({ rows: [avgRating] }); // rating

            const req: any = { headers: { authorization: mockToken } };
            const res = createMockRes();

            await profileHandler(req, res, jest.fn());

            expect(res.json).toHaveBeenCalledWith({ ...profileRow, averageRating: 4.2 });
        });
    });

    describe('updateProfileHandler', () => {
        const updatedUser = {
            email: 'user@example.com',
            firstName: 'New',
            lastName: 'Name',
            title: 'New Title',
            avatar: 'new.png',
            bio: 'Updated bio'
        };

        it('returns 401 if token is missing', async () => {
            const req: any = { headers: {} };
            const res = createMockRes();

            await updateProfileHandler(req, res, jest.fn());

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant.' });
        });

        it('updates user profile and returns it', async () => {
            (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
            (pool.query as jest.Mock)
                .mockResolvedValueOnce({}) // UPDATE
                .mockResolvedValueOnce({ rows: [updatedUser] }); // SELECT after update

            const req: any = {
                headers: { authorization: mockToken },
                body: updatedUser
            };
            const res = createMockRes();

            await updateProfileHandler(req, res, jest.fn());

            expect(pool.query).toHaveBeenCalledTimes(2);
            expect(res.json).toHaveBeenCalledWith(updatedUser);
        });
    });
});

