import { loginHandler } from '../../src/handlers/login';
import { pool } from '../../src/db/pool';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getEnvValue } from '../../src/utils/getEnv';

jest.mock('../../src/db/pool');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/utils/getEnv');

describe('login', () => {
    const req: any = {
        body: {
            email: 'test@example.com',
            password: 'password123',
        },
    };
    const res: any = {
        status: jest.fn(() => res),
        json: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if email is missing', async () => {
        req.body.email = '';
        await loginHandler(req, res, () => void {});
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email requis.' });
    });

    it('should return 401 if user is not found', async () => {
        req.body.email = 'notfound@example.com';
        req.body.password = 'pass';
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });
        await loginHandler(req, res, () => void {});
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email invalide.' });
    });

    it('should return 403 if user is unsubscribed', async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [{ subscribed: false }] });
        await loginHandler(req, res, () => void {});
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Ce compte a été désinscrit. Il sera supprimé prochainement.',
        });
    });

    it('should return 401 if password is invalid', async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [{ password: 'hashed', subscribed: true }] });
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        await loginHandler(req, res, () => void {});
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe invalide.' });
    });

    it('should return token on successful login', async () => {
        const user = { id: 1, email: 'test@example.com', password: 'hashed', subscribed: true };
        (pool.query as jest.Mock).mockResolvedValue({ rows: [user] });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('fake-token');
        (getEnvValue as jest.Mock).mockReturnValue('secret');

        await loginHandler(req, res, () => void {});
        expect(res.json).toHaveBeenCalledWith({
            message: 'Connexion réussie.',
            token: 'fake-token',
        });
    });
});
