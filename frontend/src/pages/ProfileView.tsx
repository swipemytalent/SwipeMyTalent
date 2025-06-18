import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MessageModal from '../components/MessageModal';
import { setViewedProfile } from '../redux/viewedProfileSlice';
import { setUser } from '../redux/userSlice';
import { fetchUserProfile } from '../api/userApi';
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
    const token = localStorage.getItem('token');
    if (token && !user.id) {
      fetchUserProfile(token)
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
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            dispatch(setViewedProfile(data));
          }
        } catch {}
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
          {profile.bio && (
            <div className="profile-view-bio" dangerouslySetInnerHTML={{ __html: formatBioToHtml(profile.bio) }} />
          )}
          <div className="profile-view-contact">
            <span><i className="fa fa-envelope"></i> {profile.email}</span>
          </div>
          <div className="profile-view-actions">
            <button 
              className="btn btn--primary profile-view__message-btn"
              onClick={() => setIsMessageModalOpen(true)}
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
      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientId={profile.id}
        recipientName={`${profile.firstName} ${profile.lastName}`}
      />
    </div>
  );
};

export default ProfileView; 