import { getEnvValue } from './getEnv';
import sgMail from '@sendgrid/mail';

// Service d'envoi d'emails avec SendGrid
export class EmailService {
    private static SENDGRID_API_KEY = getEnvValue('SENDGRID_API_KEY', 'SENDGRID_API_KEY_FILE');
    private static FROM_EMAIL = getEnvValue('FROM_EMAIL', 'FROM_EMAIL_FILE') || 'noreply@swipemytalent.com';
    private static FRONTEND_URL = getEnvValue('FRONTEND_URL', 'FRONTEND_URL_FILE') || 'http://localhost:3000';

    static async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<boolean> {
        try {
            // Configuration SendGrid
            if (this.SENDGRID_API_KEY) {
                sgMail.setApiKey(this.SENDGRID_API_KEY);
                
                const verificationUrl = `${this.FRONTEND_URL}/verify-email?token=${token}`;
                
                const msg = {
                    to: email,
                    from: this.FROM_EMAIL,
                    subject: 'Vérifiez votre compte SwipeMyTalent',
                    html: this.generateVerificationEmailHTML(firstName || 'Utilisateur', verificationUrl),
                    text: this.generateVerificationEmailText(firstName || 'Utilisateur', verificationUrl)
                };

                await sgMail.send(msg);
                console.log(`✅ Email de vérification envoyé à ${email}`);
                return true;
            } else {
                // Fallback en développement
                console.log(`[DEV] Email de vérification envoyé à ${email}`);
                console.log(`[DEV] Token: ${token}`);
                console.log(`[DEV] Lien de vérification: ${this.FRONTEND_URL}/verify-email?token=${token}`);
                return true;
            }
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de l\'email de vérification:', error);
            return false;
        }
    }

    private static generateVerificationEmailHTML(firstName: string, verificationUrl: string): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Vérifiez votre compte SwipeMyTalent</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Bienvenue sur SwipeMyTalent !</h1>
                </div>
                <div class="content">
                    <h2>Bonjour ${firstName},</h2>
                    <p>Merci de vous être inscrit sur <strong>SwipeMyTalent</strong> !</p>
                    <p>Pour activer votre compte et commencer à échanger vos talents, veuillez cliquer sur le bouton ci-dessous :</p>
                    
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">✅ Vérifier mon compte</a>
                    </div>
                    
                    <p><strong>Important :</strong> Ce lien expire dans 24h pour des raisons de sécurité.</p>
                    
                    <p>Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :</p>
                    <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px; font-size: 12px;">
                        ${verificationUrl}
                    </p>
                    
                    <p>À bientôt sur SwipeMyTalent !</p>
                    <p>L'équipe SwipeMyTalent</p>
                </div>
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                    <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    private static generateVerificationEmailText(firstName: string, verificationUrl: string): string {
        return `
Bienvenue sur SwipeMyTalent !

Bonjour ${firstName},

Merci de vous être inscrit sur SwipeMyTalent !

Pour activer votre compte et commencer à échanger vos talents, veuillez cliquer sur ce lien :

${verificationUrl}

Important : Ce lien expire dans 24h pour des raisons de sécurité.

Si vous n'avez pas créé de compte, ignorez cet email.

À bientôt sur SwipeMyTalent !

L'équipe SwipeMyTalent
        `;
    }

    static generateVerificationToken(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    static isTemporaryEmail(email: string): boolean {
        const tempDomains = [
            '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
            'mailinator.com', 'yopmail.com', 'temp-mail.org',
            'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
            'temp-mail.io', 'dispostable.com', 'mailnesia.com'
        ];
        const domain = email.split('@')[1]?.toLowerCase();
        return tempDomains.includes(domain || '');
    }

    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
} 