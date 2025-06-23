import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { useState } from 'react';
import ProfileModal from '../ProfileModal';
import { setViewedProfile } from '../../redux/viewedProfileSlice';
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
  const { firstName, lastName, title, avatar } = user;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = () => {};
  const handlePhotoChange = () => {};
  const handleSubmit = () => { setIsModalOpen(false); };

  const handleViewProfile = () => {
    dispatch(setViewedProfile(user));
    localStorage.setItem('viewedProfile', JSON.stringify(user));
    navigate(`/profil/${user.id}`);
  };

  return (
    <section className="dashboard__card profile-card">
      <div className="profile-card__content">
        <div className="profile-card__top">
          <div className="profile-card__name">{firstName} {lastName}</div>
        </div>
        <div className="profile-card__center">
          <div className="profile-card__avatar">
            {avatar && <img src={avatar} alt="" />}
          </div>
          <div className="profile-card__job">{title}</div>
        </div>
        <div className="profile-card__bottom">
          {!isViewOnly && (
            <button className="btn btn--primary profile-card__button" onClick={onEditProfile}>
              Compléter mon profil
            </button>
          )}
          {isViewOnly && (
            <button className="btn btn--primary profile-card__button" onClick={handleViewProfile}>
              Consulter le profil
            </button>
          )}
        </div>
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