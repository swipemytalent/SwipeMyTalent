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

export interface Conversation {
  id: string;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string;
    title: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isFromMe: boolean;
  };
  unreadCount: number;
}

export async function fetchUserConversations(userId: string): Promise<Conversation[]> {
  return await HttpService.get<Conversation[]>(`/conversations/${userId}`);
}

export async function fetchConversationMessages(conversationId: string): Promise<Message[]> {
  return await HttpService.get<Message[]>(`/conversations/${conversationId}/messages`);
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

export async function markConversationAsRead(conversationId: string): Promise<void> {
  return await HttpService.put<void>(`/conversations/${conversationId}/read`, {});
} 