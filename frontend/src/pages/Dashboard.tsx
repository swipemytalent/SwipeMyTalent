import OpportunitiesCard from '../components/cards/OpportunitiesCard';
import ProfileCard from '../components/cards/ProfileCard';
import StatsCard from '../components/cards/StatsCard';
import RecentActivityCard from '../components/cards/RecentActivityCard';
import AboutCard from '../components/cards/AboutCard';
import ProfileModal from '../components/ProfileModal';
import MessagesModal from '../components/MessagesModal';
import UnsubscribeModal from '../components/UnsubscribeModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useState, useEffect } from 'react';
import { useEditProfile } from '../hooks/useEditProfile';
import { setUser } from '../redux/userSlice';
import { fetchUserProfile } from '../api/userApi';
import { fetchUserMessages } from '../api/messagesApi';
import { AuthService } from '../services/authService';
import { LoggerService } from '../services/loggerService';
import '../styles/dashboard.scss';

const Dashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { editUser, setEditUser, handleChange, handlePhotoChange, handleSubmit, error } = useEditProfile(user);
    const [messages, setMessages] = useState<any[]>([]);
    const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
    const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);

    useEffect(() => {
        if (AuthService.isLoggedIn()) {
            fetchUserProfile()
                .then(user => dispatch(setUser(user)))
                .catch(() => {});
        }
    }, [dispatch]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!user.id) return;
            try {
                const messagesData = await fetchUserMessages(user.id);
                setMessages(messagesData);
            } catch (error) {
                LoggerService.error('Erreur lors de la récupération des messages', error);
            }
        };
        fetchMessages();
    }, [user.id]);

    const handleOpenModal = () => {
        setEditUser(user);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async () => {
        await handleSubmit();
        setIsModalOpen(false);
    };

    return (
        <div className="dashboard">
            <div className="dashboard__header">
                <h1>
                    <span className="logo-blue">Tableau</span><span className="logo-orange"> de bord</span>
                </h1>
            </div>
            <div className="dashboard__content">
                <div className="top-cards">
                    <ProfileCard onEditProfile={handleOpenModal} />
                    <AboutCard />
                </div>
                <div className="cards-grid">
                    <StatsCard 
                        stats={{ 
                            views: 0, 
                            messages: messages.length, 
                            credits: 0 
                        }}
                        onMessagesClick={() => setIsMessagesModalOpen(true)}
                    />
                    <OpportunitiesCard />
                    <RecentActivityCard />
                </div>
            </div>
            <ProfileModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={editUser}
                onChange={handleChange}
                onPhotoChange={handlePhotoChange}
                onSubmit={handleModalSubmit}
                error={error}
            />
            <MessagesModal
                isOpen={isMessagesModalOpen}
                onClose={() => setIsMessagesModalOpen(false)}
                messages={messages}
            />
            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button
                    className="dashboard-unsubscribe-link"
                    onClick={() => setIsUnsubscribeModalOpen(true)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        fontSize: '0.95rem',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    Se désinscrire
                </button>
            </div>
            <UnsubscribeModal
                isOpen={isUnsubscribeModalOpen}
                onClose={() => setIsUnsubscribeModalOpen(false)}
                userEmail={user.email}
            />
        </div>
    );
};

export default Dashboard; 