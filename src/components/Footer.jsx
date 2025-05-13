import '../styles/Footer.scss';
import { useAuth } from '../context/useAuth';

const Footer = () => {
  const { isLoggedIn } = useAuth();
  return (
    <footer className="footer">
      <div className="footer-content">
        <span className="footer-logo">
          <span className="logo-blue">SwipM</span><span className="logo-orange">yTalent</span>
        </span>
        <nav className="footer-links">
          {isLoggedIn && <a href="/">Accueil</a>}
          {isLoggedIn && <a href="/about">À propos</a>}
          {isLoggedIn && <a href="/contact">Contact</a>}
          <a href="/legal">Mentions légales</a>
        </nav>
        <span className="footer-copy">&copy; {new Date().getFullYear()} SwipeMyTalent. Tous droits réservés.</span>
      </div>
    </footer>
  );
};

export default Footer; 