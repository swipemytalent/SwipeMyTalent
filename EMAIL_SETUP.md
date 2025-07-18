# Configuration Email - SwipeMyTalent

## Configuration pour l'envoi d'emails réels avec Private Email

### Variables d'environnement requises

Pour que l'envoi d'emails fonctionne en production, vous devez configurer les variables d'environnement suivantes :

#### En développement (.env)
```env
EMAIL_PASSWORD=votre_mot_de_passe_private_email
FRONTEND_URL=http://localhost:8080
```

#### En production (fichiers secrets)
```env
EMAIL_PASSWORD_FILE=/run/secrets/email_password
FRONTEND_URL=https://swipemytalent.com
```

### Configuration Private Email (Namecheap)

Le système est configuré pour utiliser Private Email de Namecheap avec l'adresse `no-reply@swipemytalent.com`.

#### Paramètres SMTP utilisés :
- **Host:** `mail.privateemail.com`
- **Port:** `587`
- **Secure:** `false`
- **User:** `no-reply@swipemytalent.com`
- **Password:** Variable d'environnement `EMAIL_PASSWORD`

### Comment configurer le mot de passe

1. **En développement :**
   - Ajoutez `EMAIL_PASSWORD=votre_mot_de_passe_private_email` dans le fichier `.env`

2. **En production :**
   - Créez un fichier secret : `echo "votre_mot_de_passe_private_email" > /path/to/email_password`
   - Configurez `EMAIL_PASSWORD_FILE=/path/to/email_password` dans vos variables d'environnement

### Comment récupérer le mot de passe Private Email

1. **Connectez-vous à votre compte Namecheap**
2. **Allez dans "Private Email"**
3. **Trouvez votre domaine `swipemytalent.com`**
4. **Localisez la boîte mail `no-reply@swipemytalent.com`**
5. **Récupérez ou réinitialisez le mot de passe**

### Types d'emails envoyés

1. **Email de vérification** (lors de l'inscription)
   - Sujet : "Vérifiez votre adresse email - SwipeMyTalent"
   - Contient un lien de vérification valide 24h

2. **Email de bienvenue** (après vérification)
   - Sujet : "Bienvenue sur SwipeMyTalent !"
   - Confirme la vérification et guide vers la plateforme

### Mode développement

En mode `dev`, les emails sont simulés et affichés dans la console :
```
📧 [DEV] Email de vérification simulé:
   À: user@example.com
   Token: abc123...
   Username: John Doe
   Lien: http://localhost:8080/verify-email?token=abc123...
```

### Dépannage

Si les emails ne sont pas envoyés :

1. **Vérifiez les logs** pour voir les erreurs SMTP
2. **Vérifiez les variables d'environnement** sont bien configurées
3. **Testez la connexion SMTP** avec les paramètres Private Email
4. **Vérifiez que la boîte mail** `no-reply@swipemytalent.com` existe dans Private Email
5. **Vérifiez que les DNS MX** sont bien configurés pour `swipemytalent.com`

### Alternatives de configuration Private Email

Si le port 587 ne fonctionne pas, essayez :
- **Port 465** avec `secure: true`
- **Host alternatif :** `mail.privateemail.com` ou `mail.swipemytalent.com`

### Sécurité

- Les mots de passe d'email sont stockés dans des fichiers secrets en production
- Les tokens de vérification expirent après 24h
- Les tokens sont marqués comme utilisés après vérification
- Les emails contiennent des liens sécurisés avec tokens uniques 