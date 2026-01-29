import nodemailer from 'nodemailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '@services/logger.service';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: Transporter;
    private smtpConfigured: boolean = false;

    constructor(private readonly logger: LoggerService) {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        try {
            // Check if SMTP is configured
            if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
                this.logger.warn('SMTP not configured - email functionality will be disabled', 'MailService');
                this.smtpConfigured = false;
                return;
            }

            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT as string, 10),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                connectionTimeout: 10000, // 10 seconds
                greetingTimeout: 10000,
            });
            this.smtpConfigured = true;
        } catch (error) {
            this.logger.error(`Failed to initialize SMTP transporter: ${error.message}`, error.stack, 'MailService');
            this.smtpConfigured = false;
        }
    }

    async verifyConnection(): Promise<{ connected: boolean; error?: string }> {
        if (!this.smtpConfigured) {
            return { connected: false, error: 'SMTP not configured' };
        }

        try {
            await this.transporter.verify();
            this.logger.log('SMTP connection verified successfully', 'MailService');
            return { connected: true };
        } catch (error) {
            const errorMsg = `SMTP connection failed: ${error.message}`;
            this.logger.error(errorMsg, error.stack, 'MailService');
            return { connected: false, error: errorMsg };
        }
    }

    async sendVerificationEmail(email: string, token: string) {
        if (!this.smtpConfigured) {
            const error = new InternalServerErrorException('SMTP not configured - cannot send emails');
            this.logger.error('Attempted to send email but SMTP is not configured', '', 'MailService');
            throw error;
        }

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
            const detailedError = this.getDetailedSmtpError(error);
            this.logger.error(`Failed to send verification email to ${email}: ${detailedError}`, error.stack, 'MailService');
            throw new InternalServerErrorException(detailedError);
        }
    }

    async sendPasswordResetEmail(email: string, token: string) {
        if (!this.smtpConfigured) {
            const error = new InternalServerErrorException('SMTP not configured - cannot send emails');
            this.logger.error('Attempted to send email but SMTP is not configured', '', 'MailService');
            throw error;
        }

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
            const detailedError = this.getDetailedSmtpError(error);
            this.logger.error(`Failed to send password reset email to ${email}: ${detailedError}`, error.stack, 'MailService');
            throw new InternalServerErrorException(detailedError);
        }
    }

    private getDetailedSmtpError(error: any): string {
        if (error.code === 'EAUTH') {
            return 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS environment variables.';
        }
        if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
            return `Cannot connect to SMTP server at ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}. Check network/firewall settings.`;
        }
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            return 'SMTP connection timed out. Server may be unreachable or firewalled.';
        }
        if (error.responseCode >= 500) {
            return `SMTP server error (${error.responseCode}): ${error.response}`;
        }
        if (error.responseCode >= 400) {
            return `SMTP client error (${error.responseCode}): Check FROM_EMAIL and recipient addresses.`;
        }
        return error.message || 'Unknown SMTP error';
    }
}
