import ProfileCard from '../components/ProfileCard';
import StatsCard from '../components/StatsCard';
import OpportunitiesCard from '../components/OpportunitiesCard';
import RecentActivityCard from '../components/RecentActivityCard';
import '../styles/dashboard.scss';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <h1>
                    <span className="logo-blue">Tableau</span><span className="logo-orange"> de bord</span>
                </h1>
            </div>
            <div className="dashboard__content">
                <ProfileCard />
                <StatsCard stats={{ views: 0, messages: 0, credits: 0 }} />
                <OpportunitiesCard />
                <RecentActivityCard />
            </div>
        </div>
    );
};

export default Dashboard; 