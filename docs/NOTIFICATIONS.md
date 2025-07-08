# Système de Notifications Push

## Vue d'ensemble

Le système de notifications push permet aux utilisateurs de recevoir des notifications même quand ils ne sont pas connectés à la plateforme. Il utilise les Web Push API et les Service Workers.

## Fonctionnalités

- ✅ Notifications push en temps réel
- ✅ Notifications pour les messages
- ✅ Notifications pour les échanges
- ✅ Notifications pour les avis
- ✅ Interface utilisateur simple
- ✅ Gestion des permissions
- ✅ Service Worker pour la gestion en arrière-plan

## Configuration

### Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Clés VAPID pour les notifications push
VAPID_PUBLIC_KEY=votre_clé_publique_vapid
VAPID_PRIVATE_KEY=votre_clé_privée_vapid
```

### Génération des clés VAPID

Pour générer vos clés VAPID, utilisez cette commande :

```bash
npx web-push generate-vapid-keys
```

### Base de données

La table `push_subscriptions` est automatiquement créée lors de l'initialisation de la base de données.

## Architecture

### Backend

- **Service Worker** : `frontend/public/sw.js`
- **Service de notifications** : `frontend/src/services/notificationService.ts`
- **Composant de cloche** : `frontend/src/components/NotificationBell/NotificationBell.tsx`
- **Demande de permission** : `frontend/src/components/NotificationPermission/NotificationPermission.tsx`

### Frontend

- **Handlers de notifications** : `backend/handlers/notifications.ts`
- **Handlers de push** : `backend/handlers/pushNotifications.ts`
- **Service d'envoi** : `backend/utils/sendPushNotification.ts`

## Utilisation

### Pour les utilisateurs

1. **Première connexion** : Une popup demande la permission pour les notifications
2. **Cloche de notifications** : Affiche le nombre de notifications non lues
3. **Gestion** : Marquer comme lu, supprimer, voir l'historique

### Pour les développeurs

Le système envoie automatiquement des notifications pour :
- Nouveaux messages
- Demandes d'échange
- Confirmations d'échange
- Finalisation d'échange
- Nouveaux avis

## Types de notifications

- `message` : Nouveau message reçu
- `exchange_requested` : Nouvelle proposition d'échange
- `exchange_confirmed` : Échange confirmé
- `exchange_completed` : Échange terminé
- `profile_rating` : Nouvel avis reçu

## Sécurité

- Les notifications ne sont envoyées que si l'utilisateur n'est pas connecté
- Vérification des permissions côté client
- Authentification requise pour toutes les opérations
- Clés VAPID pour sécuriser les communications

## Dépannage

### Problèmes courants

1. **Notifications ne s'affichent pas**
   - Vérifiez les permissions du navigateur
   - Vérifiez que le Service Worker est enregistré

2. **Erreur de clé VAPID**
   - Vérifiez que les variables d'environnement sont correctes
   - Régénérez les clés si nécessaire

3. **Notifications en double**
   - Vérifiez la logique de vérification des utilisateurs connectés

### Logs utiles

Les logs suivants vous aideront à diagnostiquer :

```bash
# Backend
✅ Utilisateur X abonné aux notifications push
❌ Utilisateur X désabonné des notifications push
❌ Failed to send push notification: [erreur]

# Frontend
Service Worker enregistré
Notifications push initialisées avec succès
Abonnement aux notifications réussi
```

## Tests

Pour tester le système :

1. Connectez-vous avec un utilisateur
2. Activez les notifications
3. Déconnectez-vous
4. Envoyez un message depuis un autre compte
5. Vérifiez que la notification apparaît

## Support navigateur

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari (limité)
- ✅ Edge

## Performance

- Les notifications sont envoyées uniquement si l'utilisateur est hors ligne
- Rafraîchissement automatique toutes les 30 secondes
- Gestion optimisée des abonnements 