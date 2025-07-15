import { rateProfileHandler } from '../../src/handlers/rateProfile';
import { pool } from '../../src/db/pool';
import jwt from 'jsonwebtoken';
import { sendPushNotification } from '../../src/utils/sendPushNotification';

jest.mock('../../src/db/pool', () => ({
    pool: { query: jest.fn() }
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

const mockQuery = pool.query as jest.Mock;
const mockVerify = jwt.verify as jest.Mock;
const mockSendPush = sendPushNotification as jest.Mock;

const createMockRes = () => {
    const res: any = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

const createMockReq = (data: Partial<any> = {}): any => ({
    headers: {
        authorization: data.token ?? 'Bearer valid.token'
    },
    params: {
        userId: '2',
        ...data.params
    },
    body: {
        exchange_id: 10,
        serviceQuality: 5,
        communication: 4,
        timeliness: 5,
        ...data.body
    },
    app: {
        get: (key: string) => {
            if (key === 'connectedUsers') return new Map([['2', 'socket-123']]);
        }
    }
});

describe('rateProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 401 if token is missing', async () => {
        const req: any = {
            headers: {},
            app: {
                get: jest.fn().mockReturnValue(new Map())
            }
        };
        const res = createMockRes();

        await rateProfileHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token manquant.' });
    });

    it('returns 400 if input is invalid', async () => {
        mockVerify.mockReturnValue({ id: 1 });
        const req = createMockReq({
            body: {
                exchange_id: 10,
                serviceQuality: 6,
                communication: 3,
                timeliness: 2
            }
        });
        const res = createMockRes();

        await rateProfileHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'ID de l\'échange et chaque critère doivent avoir une note entre 1 et 5.'
        });
    });

    it('returns 400 if exchange is not valid or not completed', async () => {
        mockVerify.mockReturnValue({ id: 1 });
        mockQuery.mockResolvedValueOnce({ rows: [] });
        const req = createMockReq();
        const res = createMockRes();

        await rateProfileHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Échange non trouvé ou vous n\'y avez pas participé.'
        });
    });

    it('returns 400 if exchange is not completed', async () => {
        mockVerify.mockReturnValue({ id: 1 });
        mockQuery.mockResolvedValueOnce({
            rows: [{ initiator_id: 1, recipient_id: 2, status: 'pending' }]
        });
        const req = createMockReq();
        const res = createMockRes();

        await rateProfileHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Vous ne pouvez noter que les échanges terminés. Statut actuel: pending'
        });
    });

    it('returns 400 if other participant is not the rated user', async () => {
        mockVerify.mockReturnValue({ id: 1 });
        mockQuery.mockResolvedValueOnce({
            rows: [{ initiator_id: 1, recipient_id: 3, status: 'completed' }]
        });
        const req = createMockReq();
        const res = createMockRes();

        await rateProfileHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Vous ne pouvez noter que l\'autre participant de cet échange. Vous essayez de noter l\'utilisateur 2 mais l\'autre participant est 3.'
        });
    });

    it('returns 400 if rating already exists', async () => {
        mockVerify.mockReturnValue({ id: 1 });
        mockQuery
            .mockResolvedValueOnce({
                rows: [{ initiator_id: 1, recipient_id: 2, status: 'completed' }]
            })
            .mockResolvedValueOnce({
                rows: [{ id: 123 }]
            });

        const req = createMockReq();
        const res = createMockRes();

        await rateProfileHandler(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Vous avez déjà noté cette personne pour un échange précédent.'
        });
    });

    it('inserts rating, sends notification and push, returns 200', async () => {
        mockVerify.mockReturnValue({ id: 1 });
        mockQuery
            .mockResolvedValueOnce({
                rows: [{ initiator_id: 1, recipient_id: 2, status: 'completed' }]
            }) // check exchange
            .mockResolvedValueOnce({ rows: [] }) // check existing rating
            .mockResolvedValueOnce({}) // insert rating
            .mockResolvedValueOnce({ rows: [{ first_name: 'Alice', last_name: 'Smith' }] }) // get rater info
            .mockResolvedValueOnce({}); // insert notification

        const req = createMockReq();
        const res = createMockRes();

        await rateProfileHandler(req, res);

        expect(mockQuery).toHaveBeenCalledTimes(5);
        expect(mockSendPush).toHaveBeenCalledWith(2, {
            title: 'Un nouvel avis sur vous',
            body: 'Alice Smith vous a laissé un avis.'
        }, expect.any(Map));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Votre avis a été enregistré avec succès.',
            averageRating: 5
        });
    });

    it('returns 500 on error', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        mockVerify.mockReturnValue({ id: 1 });
        mockQuery
            .mockResolvedValueOnce({
                rows: [{ initiator_id: 1, recipient_id: 2, status: 'completed' }]
            }) // check exchange
            .mockRejectedValueOnce(new Error('DB Error')); // error on existing rating check

        const req = createMockReq();
        const res = createMockRes();

        await rateProfileHandler(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Une erreur est survenue lors de l\'enregistrement de votre avis. Veuillez réessayer.'
        });

        console.error = originalError;
    });
});

