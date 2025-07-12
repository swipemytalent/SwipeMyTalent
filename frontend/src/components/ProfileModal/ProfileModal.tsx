import '../../styles/ProfileModal.scss';
import ProfileForm from '../ProfileForm/ProfileForm';
import type { User } from '../ProfileForm/ProfileForm';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  error?: string | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onChange, onPhotoChange, onSubmit, error }) => {
  if (!isOpen) return null;
  return (
    <div className="profile-modal__overlay" onClick={onClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <button className="profile-modal__close" onClick={onClose}>&times;</button>
        <h2 className="profile-modal__title">Compléter mon profil</h2>
        <div className="profile-modal__content">
          <ProfileForm user={user} onChange={onChange} onPhotoChange={onPhotoChange} onSubmit={onSubmit} />
          {error && <div className="profile-form__error" style={{color: 'red', marginTop: '1rem', textAlign: 'center'}}>{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 