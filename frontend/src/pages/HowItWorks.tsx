import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HowItWorks.scss';

const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="how-it-works-container">
      <div className="hero-section">
        <h1>Comment ça marche ?</h1>
        <div className="subtitle">
          <strong>Échange, progresse, et grandis avec d'autres freelances comme toi</strong>
        </div>
      </div>

      <div className="steps-section">
        <div className="step-card">
          <div className="step-number">1️⃣</div>
          <h3>Inscris-toi et crée ton profil</h3>
          <p>Présente-toi, partage tes compétences, tes envies, et ce que tu aimerais apprendre ou proposer.</p>
        </div>

        <div className="step-card">
          <div className="step-number">2️⃣</div>
          <h3>Découvre la communauté</h3>
          <p>Parcours les profils des autres freelances juniors, trouve des talents complémentaires et inspire-toi de leurs parcours.</p>
        </div>

        <div className="step-card">
          <div className="step-number">3️⃣</div>
          <h3>Propose ou demande un échange</h3>
          <p>Besoin d'un logo ? D'un coup de main sur ton site ? Propose un échange de services ou réponds à une demande. Ici, tout le monde s'entraide !</p>
        </div>

        <div className="step-card">
          <div className="step-number">4️⃣</div>
          <h3>Collabore et apprends ensemble</h3>
          <p>Travaillez main dans la main, partagez vos retours, vos astuces, et faites grandir vos portfolios respectifs.</p>
        </div>

        <div className="step-card">
          <div className="step-number">5️⃣</div>
          <h3>Laisse un avis et fais briller la communauté</h3>
          <p>Après chaque échange, donne ton feedback : c'est précieux pour progresser et valoriser le travail de chacun.</p>
        </div>

        <div className="step-card">
          <div className="step-number">6️⃣</div>
          <h3>Recommence, progresse, et sors de l'isolement !</h3>
          <p>Plus tu participes, plus tu développes tes compétences, ton réseau, et ta confiance. SwipeMyTalent, c'est l'entraide avant tout.</p>
        </div>
      </div>

      <div className="cta-section">
        <div className="help-card">
          <h3>Des questions ? Besoin d'un coup de pouce ?</h3>
          <p>Notre équipe est là pour toi : <a href="#contact">Contacte-nous</a> ou consulte la FAQ.</p>
          <p className="welcome-message">Bienvenue dans la communauté SwipeMyTalent !</p>
        </div>
        
        <div className="action-buttons">
          <button onClick={() => navigate('/register')} className="btn-primary">
            Rejoindre la communauté
          </button>
          <button onClick={() => navigate('/talents')} className="btn-secondary">
            Découvrir des talents
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks; 