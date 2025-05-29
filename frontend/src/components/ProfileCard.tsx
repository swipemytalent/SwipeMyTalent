import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useState } from 'react';
import ProfileModal from './ProfileModal';
import { setViewedProfile } from '../redux/viewedProfileSlice';
import { useNavigate } from 'react-router-dom';

interface UserWithBio {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  avatar?: string;
  bio?: string;
}

interface ProfileCardProps {
  onEditProfile?: () => void;
  user?: UserWithBio;
  isViewOnly?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ onEditProfile, user: propUser, isViewOnly = false }) => {
  const storeUser = useSelector((state: RootState) => state.user) as UserWithBio;
  const user = propUser || storeUser;
  const { firstName, lastName, title, avatar, bio } = user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = () => {};
  const handlePhotoChange = () => {};
  const handleSubmit = () => { setIsModalOpen(false); };

  const handleViewProfile = () => {
    dispatch(setViewedProfile(user));
    navigate(`/profil/${user.id}`);
  };

  return (
    <section className="dashboard__card profile-card">
      <div className="profile-card__content-centered">
        <h3 className="profile-card__name">{firstName} {lastName}</h3>
        <div className="profile-card__avatar">
          {avatar && <img src={avatar} alt="Avatar" />}
        </div>
        <p className="profile-card__job">{title}</p>
        {bio && <p className="profile-card__bio">{bio}</p>}
        {isViewOnly && (
          <button className="btn btn--primary profile-card__button" onClick={handleViewProfile}>
            Consulter le profil
          </button>
        )}
        {!isViewOnly && (
          <button className="btn btn--primary profile-card__button" onClick={onEditProfile}>
            Compléter mon profil
          </button>
        )}
      </div>
      {!isViewOnly && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={user}
          onChange={handleChange}
          onPhotoChange={handlePhotoChange}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
};

export default ProfileCard; 