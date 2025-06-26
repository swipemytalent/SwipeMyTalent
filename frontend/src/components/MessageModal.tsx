import { useState } from 'react';
import { sendMessage } from '../api/messagesApi';
import { AuthService } from '../services/authService';
import '../styles/MessageModal.scss';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, recipientId, recipientName }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      const senderId = AuthService.getUserId();
      if (!senderId) throw new Error('Utilisateur non authentifié');

      await sendMessage({
        sender_id: senderId,
        receiver_id: recipientId,
        content: message  
      });

      setMessage('');
      onClose();
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
        <form className="message-modal__form" onSubmit={handleSubmit}>
          <div className="message-modal__content">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez votre message ici..."
              rows={5}
              required
            />
            {error && <div className="message-modal__error">{error}</div>}
          </div>
          <button 
            type="submit" 
            className="btn btn--primary message-modal__submit"
            disabled={isSending}
          >
            {isSending ? 'Envoi en cours...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageModal; 