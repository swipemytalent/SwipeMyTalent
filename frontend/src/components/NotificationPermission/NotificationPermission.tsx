import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { notificationService } from '../../services/notificationService';
import { AuthService } from '../../services/authService';
import '../../styles/NotificationPermission.scss';

const NotificationPermission: React.FC = () => {
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const hasAskedBefore = localStorage.getItem('notification-permission-asked');
    if (hasAskedBefore) {
      setHasAsked(true);
      return;
    }

    const timer = setTimeout(() => {
      if (AuthService.isLoggedIn() && user.id && !hasAsked) {
        setShowPermissionRequest(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user.id, hasAsked]);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    
    try {
      const success = await notificationService.initialize(user.id?.toString() || '');
      
      if (success) {
        localStorage.setItem('notification-permission-asked', 'true');
        setHasAsked(true);
        setShowPermissionRequest(false);
      } else {
        localStorage.setItem('notification-permission-asked', 'true');
        setHasAsked(true);
        setShowPermissionRequest(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation des notifications:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('notification-permission-asked', 'true');
    setHasAsked(true);
    setShowPermissionRequest(false);
  };

  if (!showPermissionRequest || hasAsked || !AuthService.isLoggedIn()) {
    return null;
  }

  return (
    <div className="notification-permission">
      <div className="notification-permission__overlay" onClick={handleDecline} />
      <div className="notification-permission__modal">
        <div className="notification-permission__icon">🔔</div>
        <h3 className="notification-permission__title">
          Restez informé !
        </h3>
        <p className="notification-permission__message">
          Activez les notifications pour ne manquer aucun message, échange ou avis important.
        </p>
        <div className="notification-permission__actions">
          <button 
            className="notification-permission__decline"
            onClick={handleDecline}
            disabled={isRequesting}
          >
            Plus tard
          </button>
          <button 
            className="notification-permission__enable"
            onClick={handleEnableNotifications}
            disabled={isRequesting}
          >
            {isRequesting ? 'Activation...' : 'Activer les notifications'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission; 