import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { fetchUserConversations, fetchConversationMessages, sendMessage, markConversationAsRead } from '../api/messagesApi';
import { fetchUserById } from '../api/userApi';
import '../styles/MessagingSystem.scss';

interface Conversation {
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

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  receiverId: string;
  senderName?: string;
}

interface MessagingSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationsUpdate?: () => void;
  selectedUserId?: string | null;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({ isOpen, onClose, onConversationsUpdate, selectedUserId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentUser = useSelector((state: RootState) => state.user);

  const newRecipient = selectedUserId && !conversations.some(c => c.participant.id === String(selectedUserId))
    ? String(selectedUserId)
    : null;

  const [newRecipientProfile, setNewRecipientProfile] = useState<any | null>(null);
  useEffect(() => {
    if (newRecipient) {
      setNewRecipientProfile(null);
      fetchUserById(newRecipient)
        .then(setNewRecipientProfile)
        .catch(() => setNewRecipientProfile(null));
    }
  }, [newRecipient]);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      setSelectedConversation(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen && onConversationsUpdate) {
      onConversationsUpdate();
    }
  }, [isOpen, onConversationsUpdate]);

  useEffect(() => {
    if (isOpen && selectedUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.participant.id === String(selectedUserId));
      if (conv) {
        setSelectedConversation(conv);
      } else {
        setSelectedConversation(null);
      }
    }
  }, [isOpen, selectedUserId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      handleOpenConversation(selectedConversation);
    }
  }, [selectedConversation]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, selectedConversation]);

  const loadConversations = async () => {
    if (!currentUser.id) return;
    try {
      const conversationsData = await fetchUserConversations(currentUser.id);
      setConversations(conversationsData);
      if (onConversationsUpdate) onConversationsUpdate();
    } catch (err) {
      setError('Erreur lors du chargement des conversations');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messagesData = await fetchConversationMessages(conversationId);
      setMessages(messagesData);
    } catch (err) {
      setError('Erreur lors du chargement des messages');
    }
  };

  const handleOpenConversation = async (conversation: Conversation) => {
    await Promise.all([
      loadMessages(conversation.id),
      conversation.unreadCount > 0 ? markConversationAsRead(conversation.id) : Promise.resolve()
    ]);
    
    if (conversation.unreadCount > 0) {
      await loadConversations();
      if (onConversationsUpdate) onConversationsUpdate();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    setIsSending(true);
    try {
      const messageData = {
        sender_id: currentUser.id,
        receiver_id: selectedConversation.participant.id,
        content: newMessage.trim()
      };

      await sendMessage(messageData);
      setNewMessage('');
      
      await Promise.all([
        loadMessages(selectedConversation.id),
        loadConversations()
      ]);
      
      if (onConversationsUpdate) onConversationsUpdate();
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="messaging-overlay" onClick={onClose}>
      <div className="messaging-container" onClick={(e) => e.stopPropagation()}>
        <div className="messaging-header">
          <h2>Messages</h2>
          <button className="messaging-close" onClick={onClose}>&times;</button>
        </div>

        <div className="messaging-content">
          <div className="conversations-list">
            <div className="conversations-header">
              <h3>Conversations</h3>
            </div>
            
            {conversations.length === 0 ? (
              <div className="empty-state">
                <p>Aucune conversation</p>
                <small>Commencez à discuter avec d'autres talents !</small>
              </div>
            ) : (
              <div className="conversations">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="conversation-avatar">
                      {conversation.participant.avatar ? (
                        <img src={conversation.participant.avatar} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {conversation.participant.firstName.charAt(0)}
                        </div>
                      )}
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                    
                    <div className="conversation-info">
                      <div className="conversation-name">
                        {conversation.participant.firstName} {conversation.participant.lastName}
                      </div>
                      <div className="conversation-title">{conversation.participant.title}</div>
                      <div className="conversation-preview">
                        {conversation.lastMessage.isFromMe && 'Vous: '}
                        {conversation.lastMessage.content}
                      </div>
                    </div>
                    
                    <div className="conversation-time">
                      {formatTime(conversation.lastMessage.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="chat-area">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <div className="chat-participant">
                    <div className="chat-avatar">
                      {selectedConversation.participant.avatar ? (
                        <img src={selectedConversation.participant.avatar} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {selectedConversation.participant.firstName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">
                        {selectedConversation.participant.firstName} {selectedConversation.participant.lastName}
                      </div>
                      <div className="chat-title">{selectedConversation.participant.title}</div>
                    </div>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.senderId === currentUser.id ? 'sent' : 'received'}`}
                    >
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>
                        {message.senderId === currentUser.id
                          ? 'Moi'
                          : message.senderName || `${selectedConversation?.participant.firstName} ${selectedConversation?.participant.lastName}`}
                      </div>
                      <div className="message-content">
                        {message.content}
                      </div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form className="message-input-form" onSubmit={handleSendMessage}>
                  <div className="message-input-container">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      rows={1}
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      className="send-button"
                      disabled={isSending || !newMessage.trim()}
                    >
                      {isSending ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              </>
            ) : newRecipient ? (
              <>
                <div className="chat-header">
                  <div className="chat-participant">
                    <div className="chat-avatar">
                      {newRecipientProfile && newRecipientProfile.avatar ? (
                        <img src={newRecipientProfile.avatar} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {newRecipientProfile ? newRecipientProfile.firstName?.charAt(0) : String(selectedUserId).charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="chat-info">
                      <div className="chat-name">
                        {newRecipientProfile ? `${newRecipientProfile.firstName} ${newRecipientProfile.lastName}` : 'Nouveau message'}
                      </div>
                      <div className="chat-title">
                        {newRecipientProfile ? newRecipientProfile.title : `à l'utilisateur ${String(selectedUserId)}`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="messages-container" style={{flex: 1}}>
                </div>
                <form className="message-input-form" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newMessage.trim()) return;
                  setIsSending(true);
                  setError(null);
                  try {
                    await sendMessage({
                      sender_id: currentUser.id,
                      receiver_id: String(selectedUserId),
                      content: newMessage.trim()
                    });
                    setNewMessage('');
                    await loadConversations();
                    if (onConversationsUpdate) onConversationsUpdate();
                  } catch (err) {
                    setError("Erreur lors de l'envoi du message");
                  } finally {
                    setIsSending(false);
                  }
                }}>
                  <div className="message-input-container">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      rows={1}
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      className="send-button"
                      disabled={isSending || !newMessage.trim()}
                    >
                      {isSending ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                  {error && <div style={{color: 'red', marginTop: 8}}>{error}</div>}
                </form>
              </>
            ) : (
              <div className="chat-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">💬</div>
                  <h3>Sélectionnez une conversation</h3>
                  <p>Choisissez un contact pour commencer à discuter</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>&times;</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingSystem; 