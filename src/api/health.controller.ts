import { Controller, Get } from '@nestjs/common';
import { MailService } from '@infrastructure/mail.service';
import { LoggerService } from '@infrastructure/logger.service';

@Controller('api/health')
export class HealthController {
    constructor(
        private readonly mail: MailService,
        private readonly logger: LoggerService,
    ) { }

    @Get('smtp')
    async checkSmtp() {
        try {
            const result = await this.mail.verifyConnection();
            return {
                service: 'smtp',
                status: result.connected ? 'connected' : 'disconnected',
                ...(result.error && { error: result.error }),
                config: {
                    host: process.env.SMTP_HOST || 'not set',
                    port: process.env.SMTP_PORT || 'not set',
                    secure: process.env.SMTP_SECURE || 'not set',
                    user: process.env.SMTP_USER ? '***' + process.env.SMTP_USER.slice(-4) : 'not set',
                    fromEmail: process.env.FROM_EMAIL || 'not set',
                }
            };
        } catch (error) {
            this.logger.error(`SMTP health check failed: ${error.message}`, error.stack, 'HealthController');
            return {
                service: 'smtp',
                status: 'error',
                error: error.message
            };
        }
    }

    @Get()
    async checkAll() {
        const smtp = await this.checkSmtp();

        return {
            status: smtp.status === 'connected' ? 'healthy' : 'degraded',
            checks: {
                smtp
            },
            environment: {
                nodeEnv: process.env.NODE_ENV || 'not set',
                frontendUrl: process.env.FRONTEND_URL || 'not set',
            }
        };
    }
}
