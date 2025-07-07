import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StartConversationModal from '../components/StartConversationModal/StartConversationModal';
import { setViewedProfile } from '../redux/viewedProfileSlice';
import { setUser } from '../redux/userSlice';
import { openMessaging } from '../redux/messagingSlice';
import { fetchUserProfile, fetchUserById, fetchUserRatings } from '../api/userApi';
import { AuthService } from '../services/authService';
import { LoggerService } from '../services/loggerService';
import StarRating from '../components/StarRating/StarRating';
import AvisCarousel from '../components/AvisCarousel/AvisCarousel';
import SeeMoreModal from '../components/SeeMoreModal/SeeMoreModal';
import ProjetCard from '../components/ProjetCard/ProjetCard';
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
  const [avis, setAvis] = useState<any[]>([]);
  const [voirPlusModal, setVoirPlusModal] = useState(false);

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

  useEffect(() => {
    if (profile && profile.id) {
      fetchUserRatings(profile.id)
        .then((data: any) => setAvis(Array.isArray(data) ? data : []))
        .catch(() => {});
    }
  }, [profile]);

  if (!profile) {
    return <div className="profile-view__empty">Aucun profil sélectionné.</div>;
  }

  const isLong = (profile.bio || "").length > 480;
  const bioAffiche = (profile.bio || "").length > 480 ? (profile.bio || "").slice(0, 480) + "..." : (profile.bio || "");

  return (
    <div className="dashboard">
      <button className="btn btn--link retour-talents-btn" onClick={() => navigate('/talents')}>
        <i className="fa fa-arrow-left"></i> Retour aux talents
      </button>
      <div className="dashboard__content">
        <div className="top-cards">
          <div className="dashboard__card profile-card profile-card--full">
            <div className="profile-card__avatar-large">
              {profile.avatar && <img src={profile.avatar} alt="Avatar" />}
            </div>
            <div className="profile-card__name">{profile.firstName} {profile.lastName}</div>
            <div className="profile-card__title">{profile.title}</div>
            {profile.averageRating && (
              <div className="profile-card__rating">
                <StarRating rating={profile.averageRating} size="medium" showNumber={true} />
              </div>
            )}
            <div className="profile-card__actions" style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn--primary profile-view__message-btn" onClick={() => dispatch(openMessaging(String(profile.id)))}>
                <i className="fa fa-envelope"></i> Envoyer un message
              </button>
            </div>
          </div>
          <div className="dashboard__card bio-card">
            <h3 className="bio-card__title">Présentation</h3>
            {profile.bio ? (
              <div className="bio-card__content">
                <div dangerouslySetInnerHTML={{ __html: formatBioToHtml(bioAffiche || "") }} />
                {isLong && (
                  <button
                    onClick={() => setVoirPlusModal(true)}
                    className="voir-plus-btn"
                  >
                    Voir plus
                  </button>
                )}
              </div>
            ) : (
              <div className="bio-card__content">Aucune bio renseignée.</div>
            )}
          </div>
        </div>
        <div className="cards-grid">
          <div className="dashboard__card avis-card">
            <h3 className="avis-card__title">Avis reçus</h3>
            <AvisCarousel avisList={avis} />
          </div>
          <ProjetCard />
        </div>
      </div>
      <StartConversationModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipientId={profile.id}
        recipientName={`${profile.firstName} ${profile.lastName}`}
      />
      {voirPlusModal && (
        <SeeMoreModal
          isOpen={voirPlusModal}
          onClose={() => setVoirPlusModal(false)}
          htmlContent={formatBioToHtml(profile.bio || "")}
        />
      )}
    </div>
  );
};

export default ProfileView; 