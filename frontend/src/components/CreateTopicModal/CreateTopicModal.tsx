import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { createNewTopic } from '../../redux/forumSlice';
import { AppDispatch } from '../../redux/store';
import { useDispatch } from 'react-redux';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  forumId: number;
  forumName: string;
  onTopicCreated?: () => void;
}

const CreateTopicModal: React.FC<CreateTopicModalProps> = ({ 
  isOpen, 
  onClose, 
  forumId, 
  forumName,
  onTopicCreated 
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    setSuccess(null);

    try {
      await dispatch(createNewTopic({
        forumId,
        title: title.trim(),
        content: content.trim()
      })).unwrap();

      setTitle('');
      setContent('');
      setSuccess('Topic créé avec succès !');
      
      setTimeout(() => {
        onClose();
        setSuccess(null);
        if (onTopicCreated) {
          onTopicCreated();
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création du topic');
    } finally {
      setIsCreating(false);
    }
  };

  return createPortal(
    <div className="message-modal__overlay" onClick={onClose}>
      <div className="message-modal" onClick={e => e.stopPropagation()}>
        <button className="message-modal__close" onClick={onClose}>&times;</button>
        <h2 className="message-modal__title">Créer un nouveau topic dans {forumName}</h2>
        
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
            <input
              type="text"
              placeholder="Titre du topic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isCreating}
              style={{
                width: '100%',
                padding: '1rem',
                border: '1.5px solid var(--bg-card-hover)',
                borderRadius: '0.7rem',
                fontSize: '1rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
                background: 'var(--bg-card-hover)',
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contenu du topic..."
              rows={8}
              required
              disabled={isCreating}
            />
            {error && <div className="message-modal__error">{error}</div>}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn" 
              onClick={onClose} 
              disabled={isCreating}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn--primary"
              disabled={isCreating || !title.trim() || !content.trim()}
            >
              {isCreating ? 'Création...' : 'Créer le topic'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateTopicModal; 