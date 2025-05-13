import { useAuth } from '../context/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.scss';

const SunIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="5" fill="#FFD600" stroke="#FFD600" strokeWidth="2"/>
    <g stroke="#FFA000" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </g>
  </svg>
);
const MoonIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1 1 11.21 3A7 7 0 0 0 21 12.79Z" fill="#90CAF9" stroke="#1976D2" strokeWidth="2"/>
  </svg>
);

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    document.body.classList.toggle('dark-mode', prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      document.body.classList.toggle('dark-mode', !isDarkMode);
      return !prev;
    });
  };

  return (
    <nav className={`navbar${isDarkMode ? ' dark-navbar' : ''}`}>
      <a href="/" className="logo">
        <span className="logo-blue">SwipM</span><span className="logo-orange">yTalent</span>
      </a>

      {isLoggedIn && (
        <ul className="nav-links">
          <li><a href="/">Accueil</a></li>
          <li><a href="/talent">Talents</a></li>
          <li><a href="/about">À propos</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      )}

      <div className="auth-buttons">
        {!isLoggedIn ? (
          <>
            <button className="login" onClick={() => navigate('/login')}>
              Connexion
            </button>
            <button className="signup" onClick={() => navigate('/signup')}>
              S'inscrire
            </button>
          </>
        ) : (
          <button className="logout" onClick={logout}>
            Déconnexion
          </button>
        )}
        <button className="theme-toggle-navbar" onClick={toggleTheme} title="Changer le mode sombre/clair">
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 