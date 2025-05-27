import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useState } from 'react';
import ProfileModal from './ProfileModal';

interface ProfileCardProps {
  onEditProfile?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onEditProfile }) => {
  const user = useSelector((state: RootState) => state.user);
  const { firstName, lastName, title, avatar } = user;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = () => {};
  const handlePhotoChange = () => {};
  const handleSubmit = () => { setIsModalOpen(false); };

  return (
    <section className="dashboard__card profile-card">
      <div className="profile-card__content-centered">
        <h3 className="profile-card__name">{firstName || lastName ? `${firstName} ${lastName}` : 'Freelance'}</h3>
        <div className="profile-card__avatar">
          {avatar && <img src={avatar} alt="Avatar" />}
        </div>
        <p className="profile-card__job">{title || 'Mon Profil'}</p>
        <button className="btn btn--primary profile-card__button" onClick={onEditProfile}>Compléter mon profil</button>
      </div>
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={user}
        onChange={handleChange}
        onPhotoChange={handlePhotoChange}
        onSubmit={handleSubmit}
      />
    </section>
  );
};

export default ProfileCard; 