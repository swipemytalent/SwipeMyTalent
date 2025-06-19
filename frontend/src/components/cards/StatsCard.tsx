import '../../styles/StatsCard.scss';
import dashboardData from '../../data/dashboardData.json';

interface Stats {
  views: number;
  messages: number;
  credits: number;
}

interface StatCardProps {
  stats: Stats;
  onMessagesClick?: () => void;
}

const StatsCard: React.FC<StatCardProps> = ({ stats, onMessagesClick }) => {
  return (
    <section className="dashboard__card stats-card">
      <h2>{dashboardData.stats.title}</h2>
      <div className="stats-card__grid">
        <div className="stats-card__item">
          <span className="stats-card__number">{stats.views}</span>
          <span className="stats-card__label">{dashboardData.stats.views.label}</span>
        </div>
        <div className="stats-card__item stats-card__item--clickable" onClick={onMessagesClick} style={{cursor: onMessagesClick ? 'pointer' : 'default'}}>
          <span className="stats-card__number">{stats.messages}</span>
          <span className="stats-card__label">{dashboardData.stats.messages.label}</span>
        </div>
        <div className="stats-card__item">
          <span className="stats-card__number">{stats.credits}</span>
          <span className="stats-card__label">{dashboardData.stats.matches.label}</span>
        </div>
      </div>
    </section>
  );
};

export default StatsCard; 