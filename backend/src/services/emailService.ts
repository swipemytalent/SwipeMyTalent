import crypto from 'crypto';
import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateExpiration(): Date {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24); // Expire dans 24h
    return expiration;
  }

  private static async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    // Configuration pour Private Email (Namecheap)
    this.transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: 'no-reply@swipemytalent.com',
        pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD_FILE
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    return this.transporter;
  }

  static async sendVerificationEmail(email: string, token: string, username: string): Promise<boolean> {
    try {
      // En mode développement, simuler l'envoi
      if (process.env.NODE_ENV === 'dev') {
        console.log('📧 [DEV] Email de vérification simulé:');
        console.log('   À:', email);
        console.log('   Token:', token);
        console.log('   Username:', username);
        console.log('   Lien:', `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${token}`);
        return true;
      }

      // En production, envoyer un vrai email
      const transporter = await this.getTransporter();
      const verificationUrl = `${process.env.FRONTEND_URL || 'https://swipemytalent.com'}/verify-email?token=${token}`;

      const mailOptions = {
        from: '"SwipeMyTalent" <no-reply@swipemytalent.com>',
        to: email,
        subject: 'Vérifiez votre adresse email - SwipeMyTalent',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">SwipeMyTalent</h1>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px;">
              <h2 style="color: #1e293b; margin-top: 0;">Bonjour ${username} !</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                Merci de vous être inscrit sur SwipeMyTalent ! Pour activer votre compte, 
                veuillez cliquer sur le bouton ci-dessous :
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #2563eb; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 6px; display: inline-block; 
                          font-weight: bold;">
                  Vérifier mon email
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
              </p>
              
              <p style="color: #64748b; font-size: 14px;">
                Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte sur SwipeMyTalent, 
                vous pouvez ignorer cet email.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
              <p>© 2024 SwipeMyTalent. Tous droits réservés.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('📧 Email de vérification envoyé à:', email);
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'dev') {
        console.log('📧 [DEV] Email de bienvenue simulé à:', email);
        return true;
      }

      const transporter = await this.getTransporter();

      const mailOptions = {
        from: '"SwipeMyTalent" <no-reply@swipemytalent.com>',
        to: email,
        subject: 'Bienvenue sur SwipeMyTalent !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">SwipeMyTalent</h1>
            </div>
            
            <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px;">
              <h2 style="color: #1e293b; margin-top: 0;">Bienvenue ${username} !</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                Félicitations ! Votre compte a été vérifié avec succès. 
                Vous pouvez maintenant profiter de toutes les fonctionnalités de SwipeMyTalent.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://swipemytalent.com'}" 
                   style="background-color: #2563eb; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 6px; display: inline-block; 
                          font-weight: bold;">
                  Accéder à la plateforme
                </a>
              </div>
              
              <p style="color: #475569; line-height: 1.6;">
                N'hésitez pas à nous contacter si vous avez des questions. 
                Bonne découverte !
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #64748b; font-size: 12px;">
              <p>© 2024 SwipeMyTalent. Tous droits réservés.</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('📧 Email de bienvenue envoyé à:', email);
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
      return false;
    }
  }
} 