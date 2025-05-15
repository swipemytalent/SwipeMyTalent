import React from 'react';
import dashboardData from '../../data/dashboardData.json';

const OpportunitiesCard = () => {
  return (
    <section className="dashboard__card opportunities-card">
      <h2>{dashboardData.opportunities.title}</h2>
      <div className="opportunities-card__empty">
        <p>{dashboardData.opportunities.empty.message}</p>
        <button className="btn btn--primary">{dashboardData.opportunities.empty.button}</button>
      </div>
    </section>
  );
};

export default OpportunitiesCard; 