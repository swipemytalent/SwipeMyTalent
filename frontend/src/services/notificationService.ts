class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  async isNotificationPermissionGranted(): Promise<boolean> {
    if (!this.isSupported) return false;
    return Notification.permission === 'granted';
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Notifications non supportées par ce navigateur');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  }

  async registerServiceWorker(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker enregistré:', this.swRegistration);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error);
      return false;
    }
  }

  async subscribeToPushNotifications(userId: string): Promise<boolean> {
    if (!this.swRegistration || !this.isSupported) return false;

    try {
      const response = await fetch('/api/push/vapid-public-key');
      if (!response.ok) {
        throw new Error('Impossible de récupérer la clé VAPID');
      }
      const vapidPublicKey = await response.text();

      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      const subscribeResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: userId
        })
      });

      if (!subscribeResponse.ok) {
        throw new Error('Erreur lors de l\'enregistrement de la subscription');
      }

      console.log('Abonnement aux notifications réussi');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'abonnement aux notifications:', error);
      return false;
    }
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Désabonnement des notifications réussi');
      return true;
    } catch (error) {
      console.error('Erreur lors du désabonnement:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async initialize(userId: string): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Notifications non supportées');
      return false;
    }

    if (!(await this.isNotificationPermissionGranted())) {
      const granted = await this.requestNotificationPermission();
      if (!granted) {
        console.log('Permission de notification refusée');
        return false;
      }
    }

    const registered = await this.registerServiceWorker();
    if (!registered) {
      return false;
    }

    return await this.subscribeToPushNotifications(userId);
  }
}

export const notificationService = new NotificationService(); 