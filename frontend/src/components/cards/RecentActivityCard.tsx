import dashboardData from '../../data/dashboardData.json';
import '../../styles/RecentActivityCard.scss';

const RecentActivityCard = () => {
  return (
    <section className="dashboard__card recent-activity-card">
      <h2>{dashboardData.recentActivity.title}</h2>
      <div className="recent-activity-card__empty">
        <p>{dashboardData.recentActivity.empty.message}</p>
      </div>
    </section>
  );
};

export default RecentActivityCard; 