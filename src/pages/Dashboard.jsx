import React from 'react';
import ProfileCard from '../components/dashboard/ProfileCard';
import StatsCard from '../components/dashboard/StatsCard';
import OpportunitiesCard from '../components/dashboard/OpportunitiesCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import '../styles/Dashboard.scss';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>
          <span className="logo-blue">Tableau</span><span className="logo-orange"> de bord</span>
        </h1>
      </div>
      
      <div className="dashboard__content">
        <ProfileCard />
        <StatsCard />
        <OpportunitiesCard />
        <RecentActivityCard />
      </div>
    </div>
  );
};

export default Dashboard; 