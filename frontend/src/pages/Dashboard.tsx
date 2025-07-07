import OpportunitiesCard from '../components/OpportunitiesCard/OpportunitiesCard';
import ProfileCard from '../components/ProfileCard/ProfileCard';
import StatsCard from '../components/StatsCard/StatsCard';
import RecentActivityCard from '../components/RecentActivityCard/RecentActivityCard';
import AboutCard from '../components/AboutCard/AboutCard';
import ProfileModal from '../components/ProfileModal/ProfileModal';
import MessagingSystem from '../components/MessagingSystem/MessagingSystem';
import UnsubscribeModal from '../components/UnsubscribeModal/UnsubscribeModal';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useState, useEffect, useCallback } from 'react';
import { useEditProfile } from '../hooks/useEditProfile';
import { setUser } from '../redux/userSlice';
import { closeMessaging } from '../redux/messagingSlice';
import { fetchUserProfile } from '../api/userApi';
import { fetchUserConversations } from '../api/messagesApi';
import { AuthService } from '../services/authService';
import { LoggerService } from '../services/loggerService';
import '../styles/dashboard.scss';

const Dashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.user);
    const messaging = useSelector((state: RootState) => state.messaging);
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { editUser, setEditUser, handleChange, handlePhotoChange, handleSubmit, error } = useEditProfile(user);
    const [conversations, setConversations] = useState<any[]>([]);
    const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
    const [refreshStat, setRefreshStat] = useState(0);

    useEffect(() => {
        if (AuthService.isLoggedIn()) {
            fetchUserProfile()
                .then(user => dispatch(setUser(user)))
                .catch(() => {});
        }
    }, [dispatch]);

    const fetchConversations = useCallback(async () => {
        if (!user.id) return;
        try {
            const conversationsData = await fetchUserConversations(user.id);
            setConversations(conversationsData);
        } catch (error) {
            LoggerService.error('Erreur lors de la récupération des conversations', error);
        }
    }, [user.id]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations, refreshStat]);

    const handleOpenModal = () => {
        setEditUser(user);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async () => {
        await handleSubmit();
        setIsModalOpen(false);
    };

    const updateStats = useCallback(() => {
        setRefreshStat(r => r + 1);
    }, []);

    const handleMessagingClose = () => {
        dispatch(closeMessaging());
    };

    useEffect(() => {
        if (!messaging.isOpen) {
            updateStats();
        }
    }, [messaging.isOpen, updateStats]);

    const unreadCount = conversations.reduce((acc, conv) => {
        const n = Number(conv.unreadCount);
        if (!isFinite(n) || n < 0) return acc;
        return acc + n;
    }, 0);
    const displayUnread = unreadCount > 99 ? '99+' : unreadCount;

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
                            messages: displayUnread, 
                            credits: 0 
                        }}
                        onMessagesClick={() => dispatch({ type: 'messaging/openMessaging', payload: null })}
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
            <MessagingSystem
                isOpen={messaging.isOpen}
                selectedUserId={messaging.selectedUserId}
                onClose={handleMessagingClose}
                onConversationsUpdate={updateStats}
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