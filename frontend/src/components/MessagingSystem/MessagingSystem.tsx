import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchUserConversations, fetchConversationMessages, sendMessage, markConversationAsRead } from '../../api/messagesApi';
import { fetchUserById } from '../../api/userApi';
import { Exchange } from '../../api/exchangesApi';
import ExchangeModal from '../ExchangeModal/ExchangeModal';
import RatingModal from '../RatingModal/RatingModal';
import '../../styles/MessagingSystem.scss';

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
  const [activeTab, setActiveTab] = useState<'conversations' | 'messages'>('conversations');
  const [selectedUserInfo, setSelectedUserInfo] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    avatar?: string;
  } | null>(null);

  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedExchangeForRating, setSelectedExchangeForRating] = useState<Exchange | null>(null);

  const currentUser = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      setSelectedConversation(null);
      setSelectedUserInfo(null);
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    // Vider les messages quand l'utilisateur sélectionné change
    setMessages([]);
  }, [selectedUserId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Bloquer le scroll du body quand la messagerie est ouverte
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        // Restaurer le scroll du body quand la messagerie se ferme
        document.body.style.overflow = '';
      };
    } else {
      // S'assurer que le scroll est restauré quand la messagerie n'est pas ouverte
      document.body.style.overflow = '';
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
        setSelectedUserInfo(null);
      } else {
        setSelectedConversation(null);
        setMessages([]); // Vider les messages car pas de conversation existante
        loadSelectedUserInfo(selectedUserId);
      }
    } else if (isOpen && selectedUserId && conversations.length === 0) {
      // Si pas de conversations et qu'un utilisateur est sélectionné, charger ses infos
      setSelectedConversation(null);
      setMessages([]); // Vider les messages car pas de conversation existante
      loadSelectedUserInfo(selectedUserId);
    }
  }, [isOpen, selectedUserId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      handleOpenConversation(selectedConversation);
      setActiveTab('messages');
    } else if (selectedUserId && !selectedConversation) {
      // Si un utilisateur est sélectionné mais pas de conversation, passer à l'onglet messages
      setActiveTab('messages');
      // Vider les messages car il n'y a pas de conversation existante
      setMessages([]);
    }
  }, [selectedConversation, selectedUserId]);

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

  const loadSelectedUserInfo = async (userId: string) => {
    try {
      const userData = await fetchUserById(userId);
      setSelectedUserInfo({
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        title: userData.title,
        avatar: userData.avatar
      });
    } catch (err) {
      
    }
  };

  const handleExchangeCreated = () => {
    loadConversations();
  };

  const handleRatingSubmitted = () => {
    loadConversations();
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
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      let receiverId: string;
      let isNewConversation = false;
      
      if (selectedConversation) {
        // Conversation existante
        receiverId = selectedConversation.participant.id;
      } else if (selectedUserId) {
        // Premier message - utiliser selectedUserId
        receiverId = selectedUserId;
        isNewConversation = true;
      } else {
        setError('Aucun destinataire sélectionné');
        return;
      }

      const messageData = {
        sender_id: currentUser.id,
        receiver_id: receiverId,
        content: newMessage.trim()
      };

      await sendMessage(messageData);
      setNewMessage('');
      
      // Recharger les conversations pour inclure la nouvelle
      await loadConversations();
      
      // Si c'était une nouvelle conversation, vider les messages pour éviter qu'ils s'affichent ailleurs
      if (isNewConversation) {
        setMessages([]);
      }
      
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
          <div className="messaging-tabs">
            <button 
              className={`tab-button ${activeTab === 'conversations' ? 'active' : ''}`}
              onClick={() => setActiveTab('conversations')}
            >
              Conversations
            </button>
            <button 
              className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
              disabled={!selectedConversation && !selectedUserId}
            >
              Messages
            </button>
          </div>
          <button className="messaging-close" onClick={onClose}>&times;</button>
        </div>

        <div className="messaging-content">
          {activeTab === 'conversations' && (
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
                      onClick={() => {
                        setSelectedConversation(conversation);
                        handleOpenConversation(conversation);
                      }}
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
          )}

          {activeTab === 'messages' && (selectedConversation || selectedUserId) && (
            <div className="chat-area">
              <div className="chat-header">
                <div className="chat-participant">
                  <div className="chat-avatar">
                    {selectedConversation ? (
                      selectedConversation.participant.avatar ? (
                        <img src={selectedConversation.participant.avatar} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {selectedConversation.participant.firstName.charAt(0)}
                        </div>
                      )
                    ) : selectedUserInfo ? (
                      selectedUserInfo.avatar ? (
                        <img src={selectedUserInfo.avatar} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {selectedUserInfo.firstName.charAt(0)}
                        </div>
                      )
                    ) : (
                      <div className="avatar-placeholder">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">
                      {selectedConversation 
                        ? `${selectedConversation.participant.firstName} ${selectedConversation.participant.lastName}`
                        : selectedUserInfo
                        ? `${selectedUserInfo.firstName} ${selectedUserInfo.lastName}`
                        : 'Nouvelle conversation'
                      }
                    </div>
                    <div className="chat-title">
                      {selectedConversation 
                        ? selectedConversation.participant.title 
                        : selectedUserInfo 
                        ? selectedUserInfo.title 
                        : ''
                      }
                    </div>
                  </div>
                </div>
                {selectedConversation && (
                  <div className="chat-actions">
                    <button
                      className="exchange-button"
                      onClick={() => setIsExchangeModalOpen(true)}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      💼 Proposer un échange
                    </button>
                  </div>
                )}
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
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>&times;</button>
          </div>
        )}
      </div>

      {/* Modal pour proposer un échange */}
      {selectedConversation && (
        <ExchangeModal
          isOpen={isExchangeModalOpen}
          onClose={() => setIsExchangeModalOpen(false)}
          recipientId={parseInt(selectedConversation.participant.id)}
          recipientName={`${selectedConversation.participant.firstName} ${selectedConversation.participant.lastName}`}
          onExchangeCreated={handleExchangeCreated}
        />
      )}

      {/* Modal pour laisser un avis */}
      {selectedExchangeForRating && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedExchangeForRating(null);
          }}
          exchangeId={selectedExchangeForRating.id}
          userId={selectedExchangeForRating.isInitiator ? selectedExchangeForRating.recipient.id : selectedExchangeForRating.initiator.id}
          userName={selectedExchangeForRating.isInitiator 
            ? `${selectedExchangeForRating.recipient.firstName} ${selectedExchangeForRating.recipient.lastName}`
            : `${selectedExchangeForRating.initiator.firstName} ${selectedExchangeForRating.initiator.lastName}`
          }
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
};

export default MessagingSystem; 