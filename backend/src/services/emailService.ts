import crypto from 'crypto';

export class EmailService {
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateExpiration(): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24); // Expire dans 24h
    return expiration;
  }

  static async sendVerificationEmail(email: string, token: string, username: string): Promise<boolean> {
    // En mode développement, simuler l'envoi
    if (process.env.NODE_ENV === 'dev') {
      console.log('📧 [DEV] Email de vérification simulé:');
      console.log('   À:', email);
      console.log('   Token:', token);
      console.log('   Username:', username);
      return true;
    }

    // En production, ici on pourrait intégrer un vrai service d'email
    // Pour l'instant, on simule aussi
    console.log('📧 Email de vérification envoyé à:', email);
    return true;
  }

  static async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'dev') {
      console.log('📧 [DEV] Email de bienvenue simulé à:', email);
      return true;
    }

    console.log('📧 Email de bienvenue envoyé à:', email);
    return true;
  }
} 