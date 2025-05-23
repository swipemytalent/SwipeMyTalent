import dashboardData from '../data/dashboardData.json';

const ProfileCard: React.FC = () => {
  return (
    <section className="dashboard__card profile-card">
      <div className="profile-card__content-centered">
        <h3 className="profile-card__name">{dashboardData.profile.defaultTitle}</h3>
        <div className="profile-card__avatar">
          <img src="https://via.placeholder.com/150" alt="Avatar" />
        </div>
        <p className="profile-card__job">{dashboardData.profile.title}</p>
        <button className="btn btn--primary profile-card__button" disabled>{dashboardData.profile.completeButton}</button>
      </div>
    </section>
  );
};

export default ProfileCard; 