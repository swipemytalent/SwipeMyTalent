import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';
import '../styles/profileview.scss';

const ProfileView: React.FC = () => {
  const profile = useSelector((state: RootState) => state.viewedProfile.value);
  const navigate = useNavigate();

  if (!profile) {
    return <div className="profile-view__empty">Aucun profil sélectionné.</div>;
  }

  return (
    <div className="profile-view-modern">
      <div className="profile-view-content">
        <div className="profile-view-avatar-large">
          {profile.avatar && <img src={profile.avatar} alt="Avatar" />}
        </div>
        <div className="profile-view-infos">
          <h1>{profile.firstName} {profile.lastName}</h1>
          <h2>{profile.title}</h2>
          {profile.bio && (
            <div className="profile-view-bio">
              <span>« {profile.bio} »</span>
            </div>
          )}
          <div className="profile-view-contact">
            <span><i className="fa fa-envelope"></i> {profile.email}</span>
          </div>
          <button className="btn btn--primary" onClick={() => navigate('/talents')}>Retour aux talents</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 