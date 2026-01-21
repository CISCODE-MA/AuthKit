import nodemailer from 'nodemailer';

export class MailService {
    private transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT as string, 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    async sendVerificationEmail(email: string, token: string) {
        const url = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
        await this.transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: 'Verify your email',
            text: `Click to verify your email: ${url}`
        });
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await this.transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: 'Reset your password',
            text: `Reset your password: ${url}`
        });
    }
}
