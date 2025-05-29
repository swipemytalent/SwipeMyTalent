import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
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
  const user = useSelector((state: RootState) => state.user);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender_id: Number(user.id),
          receiver_id: Number(recipientId),
          content: message
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

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