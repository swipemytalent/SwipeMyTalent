jest.mock('../../src/db/pool', () => ({
    pool: {
        query: jest.fn(),
    },
}));

jest.mock('../../src/utils/getEnv', () => ({
    getEnvValue: jest.fn(() => 'mocked'),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

import { registerHandler } from '../../src/handlers/register';
import { Request, Response } from 'express';
import { pool } from '../../src/db/pool';
import bcrypt from 'bcrypt';

describe('register', () => {
    const req = {
        body: {},
    } as Request;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as any as Response;

    const mockQuery = pool.query as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if required fields are missing', async () => {
        req.body = { email: 'a@a.com' };
        await registerHandler(req, res, () => { });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Mot de passe requis.' });
    });

    it('should return 409 if email already exists', async () => {
        req.body = {
            email: 'test@example.com',
            password: 'pass',
            firstName: 'John',
            lastName: 'Doe',
            title: 'Dev',
            avatar: 'img.png',
        };

        mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

        await registerHandler(req, res, () => { });
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email déjà utilisé.' });
    });

    it('should return 201 when user is successfully registered', async () => {
        req.body = {
            email: 'new@example.com',
            password: 'pass',
            firstName: 'Jane',
            lastName: 'Doe',
            title: 'Engineer',
            avatar: 'img.jpg',
        };

        mockQuery.mockResolvedValueOnce({ rows: [] });
        (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedpass');
        mockQuery.mockResolvedValueOnce({});

        await registerHandler(req, res, () => { });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur enregistré avec succès.' });
    });

    it('should return 500 on DB error', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        req.body = {
            email: 'new@example.com',
            password: 'pass',
            firstName: 'Jane',
            lastName: 'Doe',
            title: 'Engineer',
            avatar: 'img.jpg',
        };

        mockQuery.mockRejectedValueOnce(new Error('DB error'));

        await registerHandler(req, res, () => { });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Erreur du serveur.' });

        console.error = originalError;
    });
});

