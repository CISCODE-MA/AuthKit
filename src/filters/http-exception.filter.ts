import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger('ExceptionFilter');

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || exception.message;
                errors = (exceptionResponse as any).errors || null;
            }
        } else if (exception?.code === 11000) {
            // MongoDB duplicate key error
            status = HttpStatus.CONFLICT;
            message = 'Resource already exists';
        } else if (exception?.name === 'ValidationError') {
            // Mongoose validation error
            status = HttpStatus.BAD_REQUEST;
            message = 'Validation failed';
            errors = exception.errors;
        } else if (exception?.name === 'CastError') {
            // Mongoose cast error (invalid ObjectId)
            status = HttpStatus.BAD_REQUEST;
            message = 'Invalid resource identifier';
        } else {
            message = 'An unexpected error occurred';
        }

        // Log the error (but not in test environment)
        if (process.env.NODE_ENV !== 'test') {
            const errorLog = {
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                statusCode: status,
                message: exception?.message || message,
                stack: exception?.stack,
            };

            if (status >= 500) {
                this.logger.error('Server error', JSON.stringify(errorLog));
            } else if (status >= 400) {
                this.logger.warn('Client error', JSON.stringify(errorLog));
            }
        }

        // Send response
        const errorResponse: any = {
            statusCode: status,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (errors) {
            errorResponse.errors = errors;
        }

        // Don't send stack trace in production
        if (process.env.NODE_ENV === 'development' && exception?.stack) {
            errorResponse.stack = exception.stack;
        }

        response.status(status).json(errorResponse);
    }
}
