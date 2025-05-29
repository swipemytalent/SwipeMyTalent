import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
}

const MessagesModal: React.FC<MessagesModalProps> = ({ isOpen, onClose, messages }) => {
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);
  const userId = useSelector((state: RootState) => state.user.id);

  if (!isOpen) return null;

  const handleReply = async () => {
    setIsSending(true);
    setReplyError(null);
    setReplySuccess(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender_id: Number(userId),
          receiver_id: Number(selectedMessage.sender_id),
          content: reply
        })
      });
      if (!response.ok) throw new Error();
      setReply('');
      setReplySuccess('Message envoyé !');
    } catch {
      setReplyError("Erreur lors de l'envoi de la réponse");
    } finally {
      setIsSending(false);
    }
  };

  const getSenderName = (msg: any) => {
    if (msg.sender_first_name || msg.sender_last_name) {
      return `${msg.sender_first_name || ''} ${msg.sender_last_name || ''}`.trim();
    }
    return msg.sender_id;
  };

  return (
    <div className="message-modal__overlay" onClick={onClose}>
      <div className="message-modal" onClick={e => e.stopPropagation()} style={{maxWidth: 600, minHeight: 300}}>
        <button className="message-modal__close" onClick={onClose}>&times;</button>
        <h2 className="message-modal__title">Messages reçus</h2>
        {selectedMessage ? (
          <div style={{marginTop: 20}}>
            <div style={{marginBottom: 10, fontWeight: 'bold'}}>
              De : {getSenderName(selectedMessage)}
            </div>
            <div style={{marginBottom: 20, whiteSpace: 'pre-line'}}>{selectedMessage.content}</div>
            <div style={{marginTop: 20}}>
              <h3 style={{fontSize: '1.1em', marginBottom: 8}}>Répondre :</h3>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                rows={3}
                style={{width: '100%', borderRadius: 8, padding: 8, border: '1px solid #ccc'}}
                placeholder="Votre réponse..."
                disabled={isSending}
              />
              {replyError && <div style={{color: 'red', marginTop: 6}}>{replyError}</div>}
              {replySuccess && <div style={{color: 'green', marginTop: 6}}>{replySuccess}</div>}
              <div style={{display: 'flex', gap: 12, marginTop: 10}}>
                <button 
                  className="btn btn--primary" 
                  onClick={() => setSelectedMessage(null)}
                  disabled={isSending}
                  style={{flex: 1}}
                >
                  Retour à la liste
                </button>
                <button 
                  className="btn btn--primary" 
                  onClick={handleReply}
                  disabled={isSending || !reply.trim()}
                  style={{flex: 1}}
                >
                  {isSending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{marginTop: 20}}>
            {messages.length === 0 ? (
              <div>Aucun message reçu.</div>
            ) : (
              <ul style={{listStyle: 'none', padding: 0, maxHeight: 300, overflowY: 'auto'}}>
                {messages.map((msg) => (
                  <li key={msg.id} style={{marginBottom: 15, borderBottom: '1px solid #eee', paddingBottom: 10, cursor: 'pointer'}} onClick={() => { setSelectedMessage(msg); setReply(''); setReplyError(null); setReplySuccess(null); }}>
                    <div style={{fontWeight: 'bold'}}>De : {getSenderName(msg)}</div>
                    <div style={{color: '#555', fontSize: '0.95em', margin: '5px 0'}}>{msg.content.slice(0, 40)}{msg.content.length > 40 ? '...' : ''}</div>
                    <div style={{fontSize: '0.85em', color: '#888'}}>{msg.sent_at_pretty || msg.sent_at}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesModal; 