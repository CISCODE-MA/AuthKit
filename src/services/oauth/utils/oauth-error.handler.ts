/**
 * OAuth Error Handler Utility
 * 
 * Centralized error handling for OAuth operations.
 * Converts various errors into appropriate HTTP exceptions.
 */

import {
    UnauthorizedException,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { LoggerService } from '@services/logger.service';

export class OAuthErrorHandler {
    constructor(private readonly logger: LoggerService) {}

    /**
     * Handle OAuth provider errors
     * 
     * @param error - The caught error
     * @param provider - Name of the OAuth provider (e.g., 'Google', 'Microsoft')
     * @param operation - Description of the operation that failed
     */
    handleProviderError(error: any, provider: string, operation: string): never {
        // Re-throw known exceptions
        if (
            error instanceof UnauthorizedException ||
            error instanceof BadRequestException ||
            error instanceof InternalServerErrorException
        ) {
            throw error;
        }

        // Log and wrap unexpected errors
        this.logger.error(
            `${provider} ${operation} failed: ${error.message}`,
            error.stack || '',
            'OAuthErrorHandler'
        );
        
        throw new UnauthorizedException(`${provider} authentication failed`);
    }

    /**
     * Validate required field in OAuth profile
     * 
     * @param value - The value to validate
     * @param fieldName - Name of the field for error message
     * @param provider - Name of the OAuth provider
     */
    validateRequiredField(value: any, fieldName: string, provider: string): void {
        if (!value) {
            throw new BadRequestException(`${fieldName} not provided by ${provider}`);
        }
    }
}
