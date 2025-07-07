import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/MessageModal.scss';

interface EditBioModalProps {
  isOpen: boolean;
  currentBio: string;
  onClose: () => void;
  onSave: (newBio: string) => void;
}

const EditBioModal: React.FC<EditBioModalProps> = ({ isOpen, currentBio, onClose, onSave }) => {
  const [bio, setBio] = useState(currentBio);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      onSave(bio);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div
      className="message-modal__overlay"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="message-modal" onClick={e => e.stopPropagation()}>
        <button className="message-modal__close" onClick={onClose}>&times;</button>
        <h2 className="message-modal__title">Modifier la bio</h2>
        <form className="message-modal__form" onSubmit={handleSubmit}>
          <div className="message-modal__content">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Écris ta bio ici..."
              rows={7}
              required
            />
            {error && <div className="message-modal__error">{error}</div>}
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={onClose} disabled={isSaving}>Annuler</button>
            <button type="submit" className="btn btn--primary" disabled={isSaving}>
              {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditBioModal; 