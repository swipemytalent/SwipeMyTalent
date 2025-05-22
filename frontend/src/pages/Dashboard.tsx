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
                <h1>Bienvenue sur le tableau de bord</h1>
            </div>
        </div>
    );
};

export default Dashboard; 