import { sendMessage, getMessages } from '../../src/handlers/messages';
import { pool } from '../../src/db/pool';
import { sendPushNotification } from '../../src/utils/sendPushNotification';

jest.mock('../../src/db/pool', () => ({
    pool: { query: jest.fn() }
}));

jest.mock('../../src/utils/sendPushNotification', () => ({
    sendPushNotification: jest.fn()
}));

jest.mock('../../src/utils/date', () => ({
    formatDate: () => 'formatted_date'
}));

const mockQuery = pool.query as jest.Mock;
const createMockRes = () => {
    const res: any = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

const createMockReq = (data: any): any => {
    const req: any = {
        ...data,
        app: {
            get: (key: string) => {
                if (key === 'io') return mockIo;
                if (key === 'connectedUsers') return mockConnectedUsers;
                return undefined;
            }
        }
    };
    return req;
};

const mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
const mockConnectedUsers = new Map();

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

beforeEach(() => {
    mockQuery.mockReset();
    (sendPushNotification as jest.Mock).mockReset();
    mockIo.to.mockClear();
    mockIo.emit.mockClear();
    mockConnectedUsers.clear();
});

describe('getMessages', () => {
    it('returns messages for a user', async () => {
        const req = { params: { userId: '2' } } as any;
        const res = createMockRes();

        mockQuery.mockResolvedValueOnce({
            rows: [{
                id: 1,
                sender_id: 5,
                receiver_id: 2,
                content: 'Hi!',
                sent_at: '2023-07-01T00:00:00Z',
                sender_first_name: 'Alice',
                sender_last_name: 'Smith'
            }]
        });

        await getMessages(req, res);

        expect(mockQuery).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith([{
            id: 1,
            sender_id: 5,
            receiver_id: 2,
            content: 'Hi!',
            sent_at: '2023-07-01T00:00:00Z',
            sender_first_name: 'Alice',
            sender_last_name: 'Smith',
            sent_at_pretty: 'formatted_date',
            sent_at_relative: 'formatted_date'
        }]);
    });
});

describe('sendMessage', () => {
    it('inserts message, emits socket, creates notification, sends push', async () => {
        const req = createMockReq({
            body: {
                sender_id: 1,
                receiver_id: 2,
                content: 'Hello there!'
            }
        });
        const res = createMockRes();

        const insertedMessage = {
            id: 10,
            sender_id: 1,
            receiver_id: 2,
            content: 'Hello there!',
            sent_at: '2023-07-01T00:00:00Z'
        };

        mockConnectedUsers.set('2', 'socket-abc');

        mockQuery
            .mockResolvedValueOnce({ rows: [insertedMessage] })
            .mockResolvedValueOnce({ rows: [{ first_name: 'John', last_name: 'Doe' }] })
            .mockResolvedValueOnce({});

        await sendMessage(req, res);

        expect(mockQuery).toHaveBeenCalledTimes(3);
        expect(mockIo.to).toHaveBeenCalledWith('socket-abc');
        expect(mockIo.emit).toHaveBeenCalledWith('new_message', expect.any(Object));
        expect(sendPushNotification).toHaveBeenCalledWith(
            2,
            {
                title: 'Nouveau message',
                body: 'Hello there!'
            },
            mockConnectedUsers
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            ...insertedMessage,
            sent_at_pretty: 'formatted_date',
            sent_at_relative: 'formatted_date'
        });
    });
});

