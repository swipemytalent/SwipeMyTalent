import React from 'react';
import { useAuth } from '../../context/useAuth';
import dashboardData from '../../data/dashboardData.json';

const ProfileCard = () => {
  const { user } = useAuth();

  return (
    <section className="dashboard__card profile-card">
      <h2>{dashboardData.profile.title}</h2>
      <div className="profile-card__content">
        <div className="profile-card__avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" />
          ) : (
            <div className="profile-card__avatar-placeholder">
              {user?.firstName?.[0] || 'F'}
            </div>
          )}
        </div>
        <div className="profile-card__info">
          <h3>{user?.firstName} {user?.lastName}</h3>
          <p>{user?.title || dashboardData.profile.defaultTitle}</p>
          <button className="btn btn--primary">{dashboardData.profile.completeButton}</button>
        </div>
      </div>
    </section>
  );
};

export default ProfileCard; 