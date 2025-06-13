import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import '../styles/navbar.scss';

const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Détection de la page courante
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  // Détection de connexion
  const isLoggedIn = !!localStorage.getItem('token');

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        <span className="logo-blue">SwipeM</span><span className="logo-orange">yTalent</span>
      </NavLink>

      {/* Masquer la navbar sur /login et /register */}
      {!(isLogin || isRegister) && isLoggedIn && (
        <>
          <button className="menu-toggle" onClick={toggleMenu}>
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Accueil</NavLink></li>
            <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Mon espace</NavLink></li>
            <li><NavLink to="/talents" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Talents</NavLink></li>
          </ul>
        </>
      )}

      <div className="auth-buttons">
        {!isLoggedIn ? (
          <>
            <button className="login" onClick={() => navigate('/login')}>
              Connexion
            </button>
            <button className="signup" onClick={() => navigate('/register')}>
              S'inscrire
            </button>
          </>
        ) : (
          <button className="logout" onClick={logout}>
            <span className="logout-text">Déconnexion</span>
            <span className="logout-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#F8485E" stroke="none"/>
                <rect x="15" y="8" width="2" height="10" rx="1" fill="#fff"/>
                <path d="M10.9289 21.0711C13.781 23.9232 18.219 23.9232 21.0711 21.0711C23.9232 18.219 23.9232 13.781 21.0711 10.9289" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            </span>
          </button>
        )}
        <button className="theme-toggle-navbar" onClick={toggleTheme} title="Changer le mode sombre/clair">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;