import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import '../styles/Landing.scss';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1>
          Bienvenue {user.firstName} sur <span>SwipeMyTalent</span>
        </h1>
        <div className="landing-subtitle">
          <strong>Échangez vos compétences, développez vos projets</strong><br />
          La plateforme d'entraide entre freelances et créateurs.<br />
          SwipeMyTalent vous permet d'échanger vos services avec d'autres freelances, d'obtenir des recommandations et d'élargir votre réseau professionnel.<br />
          Rejoignez une communauté basée sur l'entraide, la confiance et la collaboration pour faire avancer vos projets.
        </div>
        <div className="cta-buttons">
          <button onClick={() => navigate('/talents')} className="btn-primary">
            Découvrir des talents
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Voir mon tableau de bord
          </button>
          <button onClick={() => navigate('/comment-ca-marche')} className="btn-tertiary">
            Comment ça marche ?
          </button>
        </div>
      </div>
      
      <div className="features-section">
        <div className="feature-card">
          <h3>Échangez vos services</h3>
          <p>Collaborez avec d'autres freelances et créateurs pour avancer sur vos projets.</p>
        </div>
        <div className="feature-card">
          <h3>Obtenez des recommandations</h3>
          <p>Valorisez vos compétences grâce aux retours et avis de la communauté.</p>
        </div>
        <div className="feature-card">
          <h3>Développez votre réseau</h3>
          <p>Rencontrez des profils inspirants et élargissez vos opportunités professionnelles.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing; 