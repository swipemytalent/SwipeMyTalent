import { createPortal } from 'react-dom';

interface SeeMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
}

const SeeMoreModal: React.FC<SeeMoreModalProps> = ({ isOpen, onClose, htmlContent }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="profile-modal__overlay">
      <div className="profile-modal">
        <button
          className="profile-modal__close"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="profile-modal__content">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SeeMoreModal; 