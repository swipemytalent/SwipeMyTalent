import React, { useState } from 'react';
import { sendMessage } from '../api/messagesApi';
import { AuthService } from '../services/authService';
import '../styles/MessageModal.scss';

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

const StartConversationModal: React.FC<StartConversationModalProps> = ({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientName 
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const senderId = AuthService.getUserId();
      if (!senderId) throw new Error('Utilisateur non authentifié');

      await sendMessage({
        sender_id: senderId,
        receiver_id: recipientId,
        content: message.trim()
      });

      setMessage('');
      setSuccess('Message envoyé avec succès !');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="message-modal__overlay" onClick={onClose}>
      <div className="message-modal" onClick={e => e.stopPropagation()}>
        <button className="message-modal__close" onClick={onClose}>&times;</button>
        <h2 className="message-modal__title">Envoyer un message à {recipientName}</h2>
        
        {success && (
          <div className="message-modal__success" style={{ 
            color: 'green', 
            backgroundColor: '#e8f5e8', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}
        
        <form className="message-modal__form" onSubmit={handleSubmit}>
          <div className="message-modal__content">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez votre message ici..."
              rows={5}
              required
              disabled={isSending}
            />
            {error && <div className="message-modal__error">{error}</div>}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn" 
              onClick={onClose} 
              disabled={isSending}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn--primary message-modal__submit"
              disabled={isSending || !message.trim()}
            >
              {isSending ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartConversationModal; 