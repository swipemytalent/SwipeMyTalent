import { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { AuthService } from '../../services/authService';
import NotificationBell from '../NotificationBell/NotificationBell';
import logo from '../../assets/Logo-SMT.webp';
import '../../styles/navbar.scss';

const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const navbarRef = useRef<HTMLDivElement | null>(null);

  const isLoggedIn = AuthService.isLoggedIn();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const logout = () => {
    AuthService.removeToken();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      document.body.classList.toggle('dark-mode', !isDarkMode);
      return !prev;
    });
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      <NavLink to="/" className="logo">
        <img src={logo} alt="Logo SwipeMyTalent" className="logo-img" />
      </NavLink>
      <div className="nav-main">
        <div className="logo-text">
          <span className="logo-blue">SwipeM</span><span className="logo-orange">yTalent</span>
        </div>
        {isLoggedIn ? (
          <>
            {isMobile && (
              <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            )}
            <ul className={`nav-links${isMobile && isMenuOpen ? ' active' : ''}`}> 
              <li><NavLink to="/" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Accueil</NavLink></li>
              <li><NavLink to="/comment-ca-marche" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Comment ça marche</NavLink></li>
              <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Mon espace</NavLink></li>
              <li><NavLink to="/talents" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Talents</NavLink></li>
            </ul>
          </>
        ) : (
          <ul className="nav-links-public">
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Accueil</NavLink></li>
            <li><NavLink to="/comment-ca-marche" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Comment ça marche</NavLink></li>
          </ul>
        )}
      </div>
      <div className="auth-buttons">
        {!isLoggedIn ? (
          isMobile ? (
            <>
              <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
              <div className={`auth-menu-dropdown${isMenuOpen ? ' active' : ''}`}> 
                <button className="login-mobile" onClick={() => { setIsMenuOpen(false); navigate('/login'); }}>
                  Connexion
                </button>
                <button className="signup-mobile" onClick={() => { setIsMenuOpen(false); navigate('/register'); }}>
                  S'inscrire
                </button>
              </div>
            </>
          ) : (
            <>
              <button className="login-desktop" onClick={() => navigate('/login')}>
                Connexion
              </button>
              <button className="signup-desktop" onClick={() => navigate('/register')}>
                S'inscrire
              </button>
            </>
          )
        ) : (
          <div className="user-actions">
            <NotificationBell />
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
          </div>
        )}
        <button className="theme-toggle-navbar" onClick={toggleTheme} title="Changer le mode sombre/clair">
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;