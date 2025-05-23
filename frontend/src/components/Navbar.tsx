import { useState, useEffect } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import '../styles/navbar.scss';

const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  return (
    <nav className={`navbar${isDarkMode ? ' dark-navbar' : ''}`}>
      <NavLink to="/" className="logo">
        <span className="logo-blue">SwipM</span><span className="logo-orange">yTalent</span>
      </NavLink>

      {/* Masquer la navbar sur /login et /register */}
      {!(isLogin || isRegister) && isLoggedIn && (
        <ul className="nav-links">
          <li><NavLink to="/" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Accueil</NavLink></li>
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Mon espace</NavLink></li>
          <li><NavLink to="/talents" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Talents</NavLink></li>
          <li><NavLink to="/about" className={({ isActive }) => isActive ? 'navlink-active' : ''}>À propos</NavLink></li>
          <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'navlink-active' : ''}>Contact</NavLink></li>
        </ul>
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
            Déconnexion
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