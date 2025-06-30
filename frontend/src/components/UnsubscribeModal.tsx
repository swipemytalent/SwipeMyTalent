import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { unsubscribe } from '../api/authApi';
import { AuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/UnsubscribeModal.scss';

interface UnsubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

const UnsubscribeModal: React.FC<UnsubscribeModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleUnsubscribe = async () => {
    setIsUnsubscribing(true);
    setError(null);
    setSuccess(null);

    try {
      await unsubscribe(userEmail);
      setSuccess('Votre compte a été désinscrit avec succès. Il sera supprimé dans 14 jours.');
      setTimeout(() => {
        AuthService.removeToken();
        navigate('/');
        window.location.reload();
      }, 3000);
    } catch (err) {
      setError('Une erreur est survenue lors de la désinscription. Veuillez réessayer.');
    } finally {
      setIsUnsubscribing(false);
    }
  };

  return createPortal(
    <div
      className="unsubscribe-modal__overlay"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="unsubscribe-modal" onClick={e => e.stopPropagation()}>
        <button className="unsubscribe-modal__close" onClick={onClose}>&times;</button>
        <h2 className="unsubscribe-modal__title">Se désinscrire</h2>
        <div className="unsubscribe-modal__content">
          <div className="unsubscribe-modal__warning">
            <div className="warning-icon">⚠️</div>
            <h3>Attention !</h3>
            <p>
              Êtes-vous sûr de vouloir vous désinscrire de SwipeMyTalent ?
            </p>
            <ul>
              <li>Votre compte sera désactivé immédiatement</li>
              <li>Vos données seront supprimées définitivement dans 14 jours</li>
              <li>Cette action est irréversible</li>
            </ul>
          </div>
          <div className="unsubscribe-modal__email">
            <strong>Email :</strong> {userEmail}
          </div>
          {error && <div className="unsubscribe-modal__error">{error}</div>}
          {success && <div className="unsubscribe-modal__success">{success}</div>}
        </div>
        <div className="unsubscribe-modal__actions">
          <button 
            type="button" 
            className="btn btn--secondary"
            onClick={onClose}
            disabled={isUnsubscribing}
          >
            Annuler
          </button>
          <button 
            type="button" 
            className="btn btn--danger"
            onClick={handleUnsubscribe}
            disabled={isUnsubscribing}
          >
            {isUnsubscribing ? 'Désinscription...' : 'Se désinscrire'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UnsubscribeModal; 