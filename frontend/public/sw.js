
const CACHE_NAME = 'swipemytalent-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Notification push reçue:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Erreur de parsing JSON dans le push:', e);
      data = { title: 'Notification', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/Logo-SMT.png',
    badge: '/Logo-SMT.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      {
        action: 'open',
        title: 'Ouvrir',
        icon: '/Logo-SMT.png'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SwipeMyTalent', options)
  );

  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function(clients) {
    clients.forEach(function(client) {
      client.postMessage({ type: 'NEW_NOTIFICATION' });
    });
  });
});

self.addEventListener('notificationclick', (event) => {
  console.log('Clic sur notification:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          if (client.url.includes(event.notification.data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (self.clients.openWindow) {
          return self.clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

self.addEventListener('message', (event) => {
  console.log('Message reçu du client:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 