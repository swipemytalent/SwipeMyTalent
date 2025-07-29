import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { AuthService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { HttpService } from '../../services/httpService';
import '../../styles/NotificationBell.scss';
import { useDispatch } from 'react-redux';
import { openMessaging } from '../../redux/messagingSlice';
import { createPortal } from 'react-dom';
import { confirmExchange, completeExchange } from '../../api/exchangesApi';
import RatingModal from '../RatingModal/RatingModal';

interface Notification {
  title: ReactNode;
  id: number;
  type: string;
  payload: any;
  is_read: boolean;
  created_at: string;
}

interface Exchange {
  id: number;
  description: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  initiator_confirmed: boolean;
  recipient_confirmed: boolean;
  created_at: string;
  completed_at?: string;
  initiator: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    title: string;
  };
  recipient: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
    title: string;
  };
  isInitiator: boolean;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await HttpService.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const initializePushNotifications = async () => {
    if (user.id && !isInitialized) {
      await notificationService.initialize(user.id.toString());
      setIsInitialized(true);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notif => notif.id !== notificationId)
        );
      }
    } catch (error) {
      // Erreur silencieuse
    }
  };

  const formatNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'message':
        return `Nouveau message de ${notification.payload.sender_name || 'quelqu\'un'}`;
      case 'exchange_requested':
        return `${notification.payload.initiatorName || 'Quelqu\'un'} vous a proposé un échange`;
      case 'exchange_confirmed':
        return `${notification.payload.by_user_name || 'Quelqu\'un'} a confirmé l'échange`;
      case 'exchange_completed':
        return `${notification.payload.completed_by_name || 'Quelqu\'un'} a terminé l'échange`;
      case 'profile_rating':
        return `${notification.payload.raterName || 'Quelqu\'un'} vous a laissé un avis`;
      default:
        return 'Nouvelle notification';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const handleConfirm = async () => {
    if (!selectedExchange) return;
    setIsUpdating(true);
    setErrorAction(null);
    try {
      await confirmExchange(selectedExchange.id);
      // Recharger les détails de l'échange
      // Ici vous devriez recharger les données de l'échange
      setSelectedExchange(prev => prev ? { ...prev, status: 'confirmed' } : null);
    } catch (err) {
      setErrorAction("Erreur lors de la confirmation");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedExchange) return;
    setIsUpdating(true);
    setErrorAction(null);
    try {
      await completeExchange(selectedExchange.id);
      setSelectedExchange(prev => prev ? { ...prev, status: 'completed' } : null);
    } catch (err) {
      setErrorAction("Erreur lors de la finalisation");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (AuthService.isLoggedIn() && user.id) {
      fetchNotifications();
      initializePushNotifications();
    }
  }, [user.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (AuthService.isLoggedIn()) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_NOTIFICATION') {
          fetchNotifications();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!AuthService.isLoggedIn()) {
    return null;
  }

  const canConfirm = selectedExchange && selectedExchange.status === 'pending' &&
    ((selectedExchange.isInitiator && !selectedExchange.initiator_confirmed) ||
     (!selectedExchange.isInitiator && !selectedExchange.recipient_confirmed));
  const canComplete = selectedExchange && selectedExchange.status === 'confirmed';

  return (
    <>
      <div className="notification-bell">
        <button 
          className="notification-bell__button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="notification-bell__icon">🔔</span>
          {unreadCount > 0 && (
            <span className="notification-bell__badge">{unreadCount}</span>
          )}
        </button>

        {isDropdownOpen && (
          <div className="notification-bell__dropdown" ref={dropdownRef}>
            <div className="notification-bell__header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  className="notification-bell__mark-all"
                  onClick={markAllAsRead}
                >
                  Tout marquer comme lu
                </button>
              )}
            </div>

            <div className="notification-bell__list">
              {notifications.length === 0 ? (
                <div className="notification-bell__empty">
                  Aucune notification
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-bell__item ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => {
                      if (notification.type === 'message' && notification.payload.sender_id) {
                        dispatch(openMessaging(notification.payload.sender_id.toString()));
                      } else if (
                        (notification.type === 'exchange_requested' || notification.type === 'exchange_confirmed' || notification.type === 'exchange_completed')
                        && notification.payload.exchange_id
                      ) {
                        // Créer un objet Exchange à partir des données de la notification
                        const mockExchange: Exchange = {
                          id: notification.payload.exchange_id,
                          description: notification.payload.description || "Échange de services",
                          status: notification.type === 'exchange_requested' ? 'pending' : 
                                 notification.type === 'exchange_confirmed' ? 'confirmed' : 'completed',
                          initiator_confirmed: notification.type === 'exchange_confirmed' || notification.type === 'exchange_completed',
                          recipient_confirmed: notification.type === 'exchange_confirmed' || notification.type === 'exchange_completed',
                          created_at: notification.created_at,
                          completed_at: notification.type === 'exchange_completed' ? notification.created_at : undefined,
                          initiator: {
                            id: notification.payload.initiator_id || 1,
                            firstName: notification.payload.initiatorName || "Utilisateur",
                            lastName: "",
                            title: "Utilisateur"
                          },
                          recipient: {
                            id: notification.payload.recipient_id || 2,
                            firstName: notification.payload.recipientName || "Utilisateur",
                            lastName: "",
                            title: "Utilisateur"
                          },
                          isInitiator: notification.payload.initiator_id === user.id
                        };
                        setSelectedExchange(mockExchange);
                      } else if (notification.type === 'profile_rating') {
                        // Pour les avis de profil, on peut rediriger vers le profil
                        if (notification.payload.rater_id) {
                          window.location.href = `/profil/${notification.payload.rater_id}`;
                        }
                      }
                      markAsRead(notification.id);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className="notification-bell__content">
                      <span className="notification-bell__title">
                        {notification.type === 'message' ? `Nouveau message de ${notification.payload.sender_name || "quelqu'un"}` : notification.title}
                      </span>
                      <p className="notification-bell__message">
                        {formatNotificationMessage(notification)}
                      </p>
                      <span className="notification-bell__time">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <button 
                      className="notification-bell__delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modale de détail d'échange (même que RecentActivityCard) */}
      {selectedExchange && createPortal(
        <div 
          className="recent-activity-modal" 
          onClick={() => setSelectedExchange(null)}
        >
          <div 
            className="recent-activity-modal__content" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="recent-activity-modal__close" 
              onClick={() => setSelectedExchange(null)}
            >
              &times;
            </button>
            
            <div className="exchange-detail">
              <div className="exchange-detail__header">
                <h3>Détail de l'échange</h3>
                <div 
                  className="exchange-detail__status"
                  style={{ 
                    backgroundColor: getStatusColor(selectedExchange.status) + '20',
                    color: getStatusColor(selectedExchange.status),
                    border: `1px solid ${getStatusColor(selectedExchange.status)}`
                  }}
                >
                  {getStatusText(selectedExchange.status)}
                </div>
              </div>

              <div className="exchange-detail__content">
                <div className="exchange-detail__section">
                  <h4>👤 Participant</h4>
                  <p className="exchange-detail__participant">
                    {selectedExchange.isInitiator 
                      ? `${selectedExchange.recipient.firstName} ${selectedExchange.recipient.lastName}`
                      : `${selectedExchange.initiator.firstName} ${selectedExchange.initiator.lastName}`
                    }
                  </p>
                </div>

                <div className="exchange-detail__section">
                  <h4>📝 Description</h4>
                  <p className="exchange-detail__description">
                    {selectedExchange.description || 'Aucune description fournie'}
                  </p>
                </div>

                <div className="exchange-detail__section">
                  <h4>📅 Dates</h4>
                  <div className="exchange-detail__dates">
                    <p><strong>Créé le :</strong> {new Date(selectedExchange.created_at).toLocaleDateString('fr-FR')}</p>
                    {selectedExchange.completed_at && (
                      <p><strong>Terminé le :</strong> {new Date(selectedExchange.completed_at).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                </div>

                {/* Actions selon le statut */}
                {errorAction && <div style={{color:'red',marginBottom:8}}>{errorAction}</div>}
                {canConfirm && (
                  <button className="btn btn--primary" onClick={handleConfirm} disabled={isUpdating}>
                    {isUpdating ? 'Confirmation...' : 'Confirmer l\'échange'}
                  </button>
                )}
                {canComplete && (
                  <button className="btn btn--success" onClick={handleComplete} disabled={isUpdating}>
                    {isUpdating ? 'Finalisation...' : 'Marquer comme terminé'}
                  </button>
                )}
              </div>
            </div>
            {/* Modale d'avis */}
            {isRatingModalOpen && (
              <RatingModal
                isOpen={isRatingModalOpen}
                onClose={()=>setIsRatingModalOpen(false)}
                exchangeId={selectedExchange.id}
                userId={selectedExchange.isInitiator ? selectedExchange.recipient.id : selectedExchange.initiator.id}
                userName={selectedExchange.isInitiator 
                  ? `${selectedExchange.recipient.firstName} ${selectedExchange.recipient.lastName}`
                  : `${selectedExchange.initiator.firstName} ${selectedExchange.initiator.lastName}`
                }
                onRatingSubmitted={async ()=>{
                  setIsRatingModalOpen(false);
                  setSelectedExchange(null);
                }}
              />
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default NotificationBell; 