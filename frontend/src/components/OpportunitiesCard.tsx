import dashboardData from '../data/dashboardData.json';
import { useNavigate } from 'react-router-dom';

const OpportunitiesCard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="dashboard__card opportunities-card">
      <h2>{dashboardData.opportunities.title}</h2>
      <div className="opportunities-card__empty">
        <p>{dashboardData.opportunities.empty.message}</p>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/talents')}
        >
          Découvrir
        </button>
      </div>
    </section>
  );
};

export default OpportunitiesCard; 