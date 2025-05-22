import { Link, useLocation } from 'react-router-dom';
import '../styles/navbar.scss';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  return (
    <nav className="navbar">
      <Link to="/login" className="navbar__logo">SwipeMyTalent</Link>
      <div className="navbar__actions">
        {isLogin && (
          <Link to="/register" className="navbar__button">Inscription</Link>
        )}
        {isRegister && (
          <Link to="/login" className="navbar__button navbar__button--secondary">Connexion</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 