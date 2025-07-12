import { getUserConversations, getConversationMessages, markConversationAsRead } from '../../src/handlers/conversations';
import { pool } from '../../src/db/pool';

jest.mock('../../src/db/pool', () => ({
    pool: { query: jest.fn() }
}));

const mockQuery = pool.query as jest.Mock;
const createMockRes = () => {
    const res: any = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

describe('getUserConversations', () => {
    it('should return conversation list', async () => {
        const req: any = { params: { userId: '1' } };
        const res = createMockRes();

        mockQuery.mockResolvedValueOnce({
            rows: [
                {
                    participant_id: 2,
                    participant_first_name: 'Alice',
                    participant_last_name: 'Doe',
                    participant_avatar: 'avatar.jpg',
                    participant_title: 'Developer',
                    last_message_content: 'Hello!',
                    last_message_time: '2023-01-01T00:00:00Z',
                    is_from_me: true,
                    unread_count: 1
                }
            ]
        });

        await getUserConversations(req, res, jest.fn());

        expect(mockQuery).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith([
            {
                id: 'conv_1_2',
                participant: {
                    id: '2',
                    firstName: 'Alice',
                    lastName: 'Doe',
                    avatar: 'avatar.jpg',
                    title: 'Developer'
                },
                lastMessage: {
                    content: 'Hello!',
                    timestamp: '2023-01-01T00:00:00Z',
                    isFromMe: true
                },
                unreadCount: 1
            }
        ]);
    });

    it('should return 500 on error', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        const req: any = { params: { userId: '1' } };
        const res = createMockRes();
        mockQuery.mockRejectedValueOnce(new Error('DB Error'));

        await getUserConversations(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erreur serveur lors de la récupération des conversations.'
        });

        console.error = originalError;
    });
});

describe('getConversationMessages', () => {
    it('should return messages for a conversation', async () => {
        const req: any = { params: { conversationId: 'conv_1_2' } };
        const res = createMockRes();

        mockQuery.mockResolvedValueOnce({
            rows: [
                {
                    id: 101,
                    sender_id: 1,
                    receiver_id: 2,
                    content: 'Hi!',
                    sent_at: '2023-01-02T00:00:00Z',
                    is_read: true,
                    sender_first_name: 'John',
                    sender_last_name: 'Smith',
                    receiver_first_name: 'Alice',
                    receiver_last_name: 'Doe'
                }
            ]
        });

        await getConversationMessages(req, res, jest.fn());

        expect(mockQuery).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith([
            {
                id: '101',
                senderId: '1',
                receiverId: '2',
                content: 'Hi!',
                timestamp: '2023-01-02T00:00:00Z',
                senderName: 'John Smith',
                receiverName: 'Alice Doe'
            }
        ]);
    });

    it('should return 400 for invalid conversationId', async () => {
        const req: any = { params: { conversationId: 'bad_id' } };
        const res = createMockRes();

        await getConversationMessages(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'ID de conversation invalide.' });
    });

    it('should return 500 on query error', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        const req: any = { params: { conversationId: 'conv_1_2' } };
        const res = createMockRes();
        mockQuery.mockRejectedValueOnce(new Error('DB Error'));

        await getConversationMessages(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erreur serveur lors de la récupération des messages.'
        });

        console.error = originalError;
    });
});

describe('markConversationAsRead', () => {
    it('should mark messages as read', async () => {
        const req: any = { params: { conversationId: 'conv_1_2' } };
        const res = createMockRes();

        mockQuery.mockResolvedValueOnce({ rowCount: 1 });

        await markConversationAsRead(req, res, jest.fn());

        expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('UPDATE messages'), [2, 1]);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Conversation marquée comme lue.'
        });
    });

    it('should return 400 for invalid conversationId', async () => {
        const req: any = { params: { conversationId: 'bad_id' } };
        const res = createMockRes();

        await markConversationAsRead(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'ID de conversation invalide.' });
    });

    it('should return 500 on query error', async () => {
        const originalError = console.error;
        console.error = jest.fn();

        const req: any = { params: { conversationId: 'conv_1_2' } };
        const res = createMockRes();
        mockQuery.mockRejectedValueOnce(new Error('DB Error'));

        await markConversationAsRead(req, res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Erreur serveur lors du marquage de la conversation.'
        });

        console.error = originalError;
    });
});

