import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { AuthService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { HttpService } from '../../services/httpService';
import '../../styles/NotificationBell.scss';
import { useDispatch } from 'react-redux';
import { openMessaging } from '../../redux/messagingSlice';
import { openExchangeModal } from '../../redux/exchangeModalSlice';

interface Notification {
  title: ReactNode;
  id: number;
  type: string;
  payload: any;
  is_read: boolean;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await HttpService.get<Notification[]>('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  const initializePushNotifications = async () => {
    if (user.id && !isInitialized) {
      const success = await notificationService.initialize(user.id.toString());
      if (success) {
        console.log('Notifications push initialisées avec succès');
      }
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
      console.error('Erreur lors du marquage de la notification:', error);
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
      console.error('Erreur lors du marquage des notifications:', error);
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
      console.error('Erreur lors de la suppression de la notification:', error);
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

  return (
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
                      dispatch(openExchangeModal(notification.payload.exchange_id));
                    } else if (notification.type === 'profile_rating') {
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
  );
};

export default NotificationBell; 