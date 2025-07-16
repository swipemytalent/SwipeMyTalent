# 🛡️ Fonctionnalités de Sécurité Anti-Abus

## Vue d'ensemble

Ce document décrit les nouvelles fonctionnalités de sécurité implémentées pour empêcher les abus sur la plateforme SwipeMyTalent.

## 🔒 Fonctionnalités Implémentées

### 1. Vérification d'Email Obligatoire

**Objectif** : Empêcher la création de comptes fictifs avec des emails temporaires.

**Fonctionnement** :
- ✅ Validation du format email
- ✅ Blocage des domaines d'emails temporaires
- ✅ Envoi d'un email de vérification lors de l'inscription
- ✅ Compte inactif jusqu'à vérification de l'email
- ✅ Token de vérification valide 24h

**Domaines bloqués** :
- 10minutemail.com, tempmail.org, guerrillamail.com
- mailinator.com, yopmail.com, temp-mail.org
- sharklasers.com, grr.la, guerrillamailblock.com
- temp-mail.io, dispostable.com, mailnesia.com

### 2. Délai de 24h Avant Notation

**Objectif** : Empêcher les échanges fictifs rapides.

**Fonctionnement** :
- ✅ Vérification que l'échange est "completed"
- ✅ Calcul du délai depuis `completed_at`
- ✅ Blocage si moins de 24h écoulées
- ✅ Message d'erreur avec temps restant

### 3. Détection de Comptes Multiples

**Objectif** : Empêcher la création de comptes multiples par la même personne.

**Fonctionnement** :
- ✅ Limite de 5 comptes par IP sur 24h
- ✅ Détection des noms/prénoms identiques récents
- ✅ Vérification de la force du mot de passe (8+ caractères)

## 🚀 Installation

### 1. Appliquer la Migration

```bash
cd backend/scripts
./apply-security-migration.sh
```

### 2. Variables d'Environnement

Ajoutez ces variables dans votre `.env` :

```env
# Configuration email (optionnel en développement)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@swipemytalent.com

# URL du frontend pour les liens de vérification
FRONTEND_URL=https://swipemytalent.com
```

## 📋 API Endpoints

### Inscription avec Vérification

```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "title": "Développeur",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Réponse** :
```json
{
  "message": "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte."
}
```

### Vérification d'Email

```http
POST /verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

### Réexpédition d'Email

```http
POST /resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 🔍 Logs et Monitoring

### Logs de Développement

En mode développement, les emails sont simulés :

```
[DEV] Email de vérification envoyé à user@example.com
[DEV] Token: abc123def456
[DEV] Lien de vérification: http://localhost:3000/verify-email?token=abc123def456
```

### Logs de Production

Les erreurs sont loggées :

```
❌ Failed to send push notification: [erreur]
❌ Erreur lors de l'envoi de l'email de vérification: [erreur]
```

## 🧪 Tests

### Test de Vérification d'Email

```bash
# Créer un compte
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","title":"Test","avatar":"https://example.com/avatar.jpg"}'

# Vérifier l'email (utiliser le token du log)
curl -X POST http://localhost:5000/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"token_from_log"}'
```

### Test du Délai de Notation

```bash
# Tenter de noter immédiatement après finalisation
curl -X POST http://localhost:5000/rate/123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"exchange_id":456,"serviceQuality":5,"communication":5,"timeliness":5}'
```

**Réponse attendue** :
```json
{
  "message": "Vous devez attendre 24h après la finalisation de l'échange avant de pouvoir noter. Temps restant: 24h."
}
```

## 🛠️ Configuration Avancée

### Personnalisation des Domaines Bloqués

Modifiez `backend/src/utils/emailService.ts` :

```typescript
static isTemporaryEmail(email: string): boolean {
    const tempDomains = [
        // Ajoutez vos domaines ici
        'votre-domaine-temporaire.com'
    ];
    // ...
}
```

### Modification du Délai de Notation

Modifiez `backend/src/handlers/rateProfile.ts` :

```typescript
// Changer 24 pour le nombre d'heures souhaité
if (hoursDiff < 24) {
    // ...
}
```

## 🔧 Dépannage

### Problèmes Courants

1. **Email non reçu**
   - Vérifiez les logs de développement
   - Utilisez `/resend-verification`

2. **Erreur de migration**
   - Vérifiez les variables d'environnement DB_*
   - Vérifiez la connexion à PostgreSQL

3. **Notation bloquée**
   - Vérifiez que l'échange est "completed"
   - Attendez 24h après finalisation

### Logs Utiles

```bash
# Vérifier les colonnes ajoutées
psql -d swipemytalent_db -c "\d users"

# Vérifier les utilisateurs non vérifiés
psql -d swipemytalent_db -c "SELECT email, email_verified FROM users WHERE email_verified = FALSE;"
```

## 📈 Métriques

### Indicateurs de Sécurité

- Nombre de comptes créés par IP sur 24h
- Nombre d'emails temporaires bloqués
- Nombre de notations bloquées par délai
- Taux de vérification d'email

### Requêtes SQL Utiles

```sql
-- Comptes non vérifiés
SELECT COUNT(*) FROM users WHERE email_verified = FALSE;

-- Comptes créés récemment
SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours';

-- Échanges avec notation rapide (pour audit)
SELECT e.id, e.completed_at, pr.created_at 
FROM exchanges e 
JOIN profile_ratings pr ON e.id = pr.exchange_id 
WHERE pr.created_at < e.completed_at + INTERVAL '24 hours';
``` 