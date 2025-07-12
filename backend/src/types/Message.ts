export interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    sent_at: string;
    is_read: boolean;
}