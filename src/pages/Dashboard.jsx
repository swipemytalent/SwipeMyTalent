import React, { useState, useEffect } from 'react';
import ProfileCard from '../components/dashboard/ProfileCard';
import StatsCard from '../components/dashboard/StatsCard';
import OpportunitiesCard from '../components/dashboard/OpportunitiesCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import ProfileModal from '../components/dashboard/ProfileModal';
import SimulateUserSwitcher from '../components/SimulateUserSwitcher';
import { useAuth } from '../context/useAuth';
import '../styles/Dashboard.scss';

const LOCAL_STORAGE_KEY = 'profile';
const LOCAL_STORAGE_VIEWS = 'profileViews';
const LOCAL_STORAGE_CURRENT_USER = 'currentUser';

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState(authUser || {});
  const [formUser, setFormUser] = useState(user);
  const [stats, setStats] = useState({ views: 0 });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_CURRENT_USER) || '{}');
    } catch {
      return {};
    }
  });

  // Charger le profil depuis le localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Met à jour currentUser à chaque changement dans le localStorage (simulateur)
  useEffect(() => {
    const onStorage = () => {
      try {
        setCurrentUser(JSON.parse(localStorage.getItem(LOCAL_STORAGE_CURRENT_USER) || '{}'));
      } catch {
        setCurrentUser({});
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Gérer les vues du profil (multi-utilisateur local)
  useEffect(() => {
    if (!user || !user.email) return;
    if (!currentUser || !currentUser.email) return;

    const viewsKey = `${LOCAL_STORAGE_VIEWS}_${user.email}`;
    let views = Number(localStorage.getItem(viewsKey) || 0);

    if (currentUser.email !== user.email) {
      const sessionKey = `viewed_${user.email}_${currentUser.email}`;
      if (!sessionStorage.getItem(sessionKey)) {
        views += 1;
        localStorage.setItem(viewsKey, views);
        sessionStorage.setItem(sessionKey, '1');
      }
    }
    setStats((prev) => ({ ...prev, views }));
  }, [user, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormUser((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormUser((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditProfile = () => {
    setFormUser(user); // On initialise le formulaire avec les données actuelles
    setModalOpen(true);
  };

  // Sauvegarder dans le localStorage à chaque enregistrement
  const handleSubmit = () => {
    setUser(formUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formUser));
    setModalOpen(false);
  };

  // Préparer les stats à passer à StatsCard
  const statsData = {
    views: stats.views,
    messages: 0,
    credits: 0,
  };

  // Pour debug : récupérer l'email du currentUser
  let currentUserEmail = currentUser.email || '';

  return (
    <div className="dashboard">
      <div style={{fontSize: '0.95rem', color: '#888', marginBottom: '0.5rem', textAlign: 'center'}}>
        <strong>Profil affiché :</strong> {user?.email || <span style={{color: 'red'}}>Aucun email</span>}<br/>
        <strong>Utilisateur courant :</strong> {currentUserEmail || <span style={{color: 'red'}}>Aucun email</span>}
      </div>
      <SimulateUserSwitcher />
      <div className="dashboard__header">
        <h1>
          <span className="logo-blue">Tableau</span><span className="logo-orange"> de bord</span>
        </h1>
      </div>
      
      <div className="dashboard__content">
        <ProfileCard onEditProfile={handleEditProfile} user={user} />
        <StatsCard stats={statsData} />
        <OpportunitiesCard />
        <RecentActivityCard />
      </div>
      <ProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        user={formUser}
        onChange={handleChange}
        onPhotoChange={handlePhotoChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Dashboard; 