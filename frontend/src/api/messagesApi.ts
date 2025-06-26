import { HttpService } from '../services/httpService';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  senderName?: string;
  receiverName?: string;
}

export async function fetchMessages(): Promise<Message[]> {
  return await HttpService.get<Message[]>('/messages');
}

export async function fetchUserMessages(userId: string): Promise<Message[]> {
  return await HttpService.get<Message[]>(`/messages/${userId}`);
}

export async function sendMessage(messageData: {
  sender_id: string;
  receiver_id: string;
  content: string;
}): Promise<Message> {
  return await HttpService.post<Message>('/messages', messageData);
} 