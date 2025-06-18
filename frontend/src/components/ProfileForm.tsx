import { useRef } from 'react';
import type { UserState } from '../redux/userSlice';

export type User = UserState & { bio?: string };

interface ProfileFormProps {
  user?: User;
  onSubmit?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPhotoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSubmit, onChange, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form className="profile-form" onSubmit={e => { e.preventDefault(); onSubmit?.(); }}>
      <div className="profile-form__group profile-form__avatar-group">
        <label htmlFor="avatar">Photo de profil</label>
        <div className="profile-form__avatar-preview" onClick={handleAvatarClick}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" />
          ) : (
            <span className="profile-form__avatar-placeholder">+</span>
          )}
        </div>
        <input
          type="file"
          id="avatar"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={onPhotoChange}
        />
      </div>
      <div className="profile-form__group">
        <label htmlFor="firstName">Prénom</label>
        <input type="text" id="firstName" name="firstName" value={user?.firstName || ''} onChange={onChange} />
      </div>
      <div className="profile-form__group">
        <label htmlFor="lastName">Nom</label>
        <input type="text" id="lastName" name="lastName" value={user?.lastName || ''} onChange={onChange} />
      </div>
      <div className="profile-form__group">
        <label htmlFor="title">Métier</label>
        <input type="text" id="title" name="title" value={user?.title || ''} onChange={onChange} />
      </div>
      <button type="submit" className="btn btn--primary">Enregistrer</button>
    </form>
  );
};

export default ProfileForm; 