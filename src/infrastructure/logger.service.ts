import { Injectable, Logger as NestLogger } from '@nestjs/common';

@Injectable()
export class LoggerService {
    private logger = new NestLogger('AuthKit');

    log(message: string, context?: string) {
        this.logger.log(message, context);
    }

    error(message: string, trace?: string, context?: string) {
        this.logger.error(message, trace, context);
    }

    warn(message: string, context?: string) {
        this.logger.warn(message, context);
    }

    debug(message: string, context?: string) {
        if (process.env.NODE_ENV === 'development') {
            this.logger.debug(message, context);
        }
    }

    verbose(message: string, context?: string) {
        if (process.env.NODE_ENV === 'development') {
            this.logger.verbose(message, context);
        }
    }
}
