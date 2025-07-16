# 📧 Configuration SendGrid pour SwipeMyTalent

## 🚀 Pourquoi SendGrid ?

- **Gratuit** : 100 emails/jour
- **Professionnel** : Délivrabilité excellente
- **Simple** : API REST facile à utiliser
- **Fiable** : Service utilisé par de grandes entreprises

## 📋 Étapes de Configuration

### 1. Créer un compte SendGrid

1. Allez sur [sendgrid.com](https://sendgrid.com)
2. Cliquez sur "Start for Free"
3. Créez votre compte
4. Vérifiez votre email

### 2. Obtenir une clé API

1. Connectez-vous à votre dashboard SendGrid
2. Allez dans **Settings** → **API Keys**
3. Cliquez sur **Create API Key**
4. Choisissez **Restricted Access** → **Mail Send**
5. Copiez la clé API (elle ne s'affiche qu'une fois !)

### 3. Configurer l'expéditeur

1. Allez dans **Settings** → **Sender Authentication**
2. Cliquez sur **Verify a Single Sender**
3. Remplissez les informations :
   - **From Name** : SwipeMyTalent
   - **From Email Address** : noreply@swipemytalent.com
   - **Reply To** : support@swipemytalent.com
4. Vérifiez l'email reçu

### 4. Configurer les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Configuration SendGrid
SENDGRID_API_KEY=SG.votre_cle_api_ici
FROM_EMAIL=noreply@swipemytalent.com
FRONTEND_URL=https://swipemytalent.com

# Autres variables...
```

## 🧪 Test de Configuration

### Test en développement

```bash
# Démarrer le serveur
cd backend
npm run dev

# Créer un compte test
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "title": "Développeur",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

### Vérifier les logs

```
✅ Email de vérification envoyé à test@example.com
```

### Vérifier dans SendGrid

1. Allez dans **Activity** → **Email Activity**
2. Vous devriez voir l'email envoyé

## 📊 Monitoring

### Dashboard SendGrid

- **Activity** : Voir tous les emails envoyés
- **Statistics** : Taux de délivrabilité, ouverture, clics
- **Bounces** : Emails qui n'ont pas pu être livrés

### Logs de l'application

```bash
# Voir les logs en temps réel
tail -f backend/logs/app.log

# Filtrer les emails
grep "Email de vérification" backend/logs/app.log
```

## 🔧 Dépannage

### Problème : Email non reçu

1. **Vérifiez la clé API**
   ```bash
   echo $SENDGRID_API_KEY
   ```

2. **Vérifiez les logs**
   ```bash
   grep "Erreur lors de l'envoi" backend/logs/app.log
   ```

3. **Vérifiez SendGrid Activity**
   - Allez dans SendGrid → Activity
   - Cherchez l'email

### Problème : Email dans les spams

1. **Vérifiez l'authentification**
   - SendGrid → Settings → Sender Authentication
   - Vérifiez que l'expéditeur est authentifié

2. **Vérifiez la réputation**
   - SendGrid → Settings → Sender Authentication
   - Vérifiez le score de réputation

### Problème : Erreur 403

```bash
# Vérifiez les permissions de la clé API
# La clé doit avoir "Mail Send" activé
```

## 📈 Métriques Utiles

### SendGrid Dashboard

- **Délivrabilité** : 99%+ (excellent)
- **Ouverture** : 20-30% (normal)
- **Clics** : 2-5% (normal)

### Commandes utiles

```bash
# Vérifier la configuration
curl -X GET "https://api.sendgrid.com/v3/user/profile" \
  -H "Authorization: Bearer $SENDGRID_API_KEY"

# Voir les statistiques
curl -X GET "https://api.sendgrid.com/v3/stats" \
  -H "Authorization: Bearer $SENDGRID_API_KEY"
```

## 💰 Coûts

### Plan Gratuit
- **100 emails/jour**
- **Parfait pour commencer**

### Plan Payant (si nécessaire)
- **50,000 emails/mois** : $14.95/mois
- **100,000 emails/mois** : $29.95/mois

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais commiter la clé API**
   ```bash
   # Ajouter à .gitignore
   echo ".env" >> .gitignore
   ```

2. **Utiliser des variables d'environnement**
   ```bash
   # En production
   export SENDGRID_API_KEY="SG.votre_cle"
   ```

3. **Limiter les permissions**
   - Clé API avec "Mail Send" seulement
   - Pas d'accès complet

## 🚀 Déploiement

### Variables d'environnement en production

```bash
# Docker
docker run -e SENDGRID_API_KEY=SG.xxx -e FROM_EMAIL=noreply@swipemytalent.com ...

# Docker Compose
environment:
  - SENDGRID_API_KEY=SG.xxx
  - FROM_EMAIL=noreply@swipemytalent.com
```

### Vérification post-déploiement

```bash
# Tester l'envoi d'email
curl -X POST https://swipemytalent.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com",...}'
``` 