import React from 'react';
import dashboardData from '../../data/dashboardData.json';

const StatsCard = () => {
  return (
    <section className="dashboard__card stats-card">
      <h2>{dashboardData.stats.title}</h2>
      <div className="stats-card__grid">
        <div className="stats-card__item">
          <span className="stats-card__number">{dashboardData.stats.views.value}</span>
          <span className="stats-card__label">{dashboardData.stats.views.label}</span>
        </div>
        <div className="stats-card__item">
          <span className="stats-card__number">{dashboardData.stats.matches.value}</span>
          <span className="stats-card__label">{dashboardData.stats.matches.label}</span>
        </div>
        <div className="stats-card__item">
          <span className="stats-card__number">{dashboardData.stats.messages.value}</span>
          <span className="stats-card__label">{dashboardData.stats.messages.label}</span>
        </div>
      </div>
    </section>
  );
};

export default StatsCard; 