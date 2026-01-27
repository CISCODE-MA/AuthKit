import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@services/logger.service';

@Injectable()
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

    constructor(private readonly logger: LoggerService) { }

    async sendVerificationEmail(email: string, token: string) {
        try {
            const url = `${process.env.FRONTEND_URL}/confirm-email?token=${token}`;
            await this.transporter.sendMail({
                from: process.env.FROM_EMAIL,
                to: email,
                subject: 'Verify your email',
                text: `Click to verify your email: ${url}`,
                html: `<p>Click <a href="${url}">here</a> to verify your email</p>`
            });
            this.logger.log(`Verification email sent to ${email}`, 'MailService');
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${email}: ${error.message}`, error.stack, 'MailService');
            throw error; // Re-throw so caller can handle
        }
    }

    async sendPasswordResetEmail(email: string, token: string) {
        try {
            const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            await this.transporter.sendMail({
                from: process.env.FROM_EMAIL,
                to: email,
                subject: 'Reset your password',
                text: `Reset your password: ${url}`,
                html: `<p>Click <a href="${url}">here</a> to reset your password</p>`
            });
            this.logger.log(`Password reset email sent to ${email}`, 'MailService');
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`, error.stack, 'MailService');
            throw error; // Re-throw so caller can handle
        }
    }
}
