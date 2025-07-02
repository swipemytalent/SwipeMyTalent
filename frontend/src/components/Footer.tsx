import { NavLink } from 'react-router-dom';
import { AuthService } from '../services/authService';
import '../styles/footer.scss';

const Footer: React.FC = () => {
  const isLoggedIn = AuthService.isLoggedIn();

  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-logo">
          <span className="logo-blue">SwipeM</span><span className="logo-orange">yTalent</span>
        </span>
        <nav className="footer-links">
          {isLoggedIn && <NavLink to="/">Accueil</NavLink>}
          <NavLink to="/cgu">Conditions générales</NavLink>
          <NavLink to="/confidentialite">Confidentialité</NavLink>
          <NavLink to="/cookies">Cookies</NavLink>
        </nav>
        <span className="footer-copy">&copy; {new Date().getFullYear()} SwipeMyTalent. Tous droits réservés.</span>
      </div>
    </footer>
  );
};

export default Footer;