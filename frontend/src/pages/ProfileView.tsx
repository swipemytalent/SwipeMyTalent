import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StartConversationModal from '../components/StartConversationModal';
import { setViewedProfile } from '../redux/viewedProfileSlice';
import { setUser } from '../redux/userSlice';
import { openMessaging } from '../redux/messagingSlice';
import { fetchUserProfile, fetchUserById } from '../api/userApi';
import { AuthService } from '../services/authService';
import { LoggerService } from '../services/loggerService';
import StarRating from '../components/StarRating';
import '../styles/profileview.scss';

function formatBioToHtml(bio: string) {
  const lines = bio.split('\n');
  let html = '';
  let inList = false;
  lines.forEach(line => {
    if (line.trim().startsWith('-')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${line.replace(/^\s*-\s*/, '')}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      if (line.trim() !== '') {
        html += `<p>${line}</p>`;
      }
    }
  });
  if (inList) html += '</ul>';
  return html;
}

const ProfileView: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.viewedProfile.value);
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const { id } = useParams();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);


  useEffect(() => {
    if (AuthService.isLoggedIn() && !user.id) {
      fetchUserProfile()
        .then(userData => dispatch(setUser(userData)))
        .catch(() => {});
    }
  }, [dispatch, user.id]);

  useEffect(() => {
    if (!profile && id) {

      const stored = localStorage.getItem('viewedProfile');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && String(parsed.id) === String(id)) {
            dispatch(setViewedProfile(parsed));
            return; 
          }
        } catch {}
      }

      const fetchProfile = async () => {
        try {
          if (!AuthService.isLoggedIn()) return;
          
          const data = await fetchUserById(id!);
          dispatch(setViewedProfile(data));
        } catch (error) {
          LoggerService.error('Erreur lors de la récupération du profil', error);
        }
      };
      fetchProfile();
    }
  }, [profile, id, dispatch]);

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
          {profile.averageRating && (
            <div className="profile-view-rating">
              <StarRating 
                rating={profile.averageRating} 
                size="medium" 
                showNumber={true}
              />
            </div>
          )}
          {profile.bio && (
            <div className="profile-view-bio" dangerouslySetInnerHTML={{ __html: formatBioToHtml(profile.bio) }} />
          )}
          <div className="profile-view-contact">
            <span><i className="fa fa-envelope"></i> {profile.email}</span>
          </div>
          <div className="profile-view-actions">
            <button 
              className="btn btn--primary profile-view__message-btn"
              onClick={() => dispatch(openMessaging(String(profile.id)))}
            >
              <i className="fa fa-envelope"></i> Envoyer un message
            </button>
            <button 
              className="btn btn--secondary"
              onClick={() => navigate('/talents')}
            >
              Retour aux talents
            </button>
          </div>
        </div>
      </div>
      <StartConversationModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientId={profile.id}
        recipientName={`${profile.firstName} ${profile.lastName}`}
      />
    </div>
  );
};

export default ProfileView; 