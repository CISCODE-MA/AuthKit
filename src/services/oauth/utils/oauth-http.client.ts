/**
 * OAuth HTTP Client Utility
 * 
 * Wrapper around axios with timeout configuration and error handling
 * for OAuth API calls.
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '@services/logger.service';

export class OAuthHttpClient {
    private readonly config: AxiosRequestConfig = {
        timeout: 10000, // 10 seconds
    };

    constructor(private readonly logger: LoggerService) {}

    /**
     * Perform HTTP GET request with timeout
     */
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await axios.get(url, { ...this.config, ...config });
            return response.data;
        } catch (error) {
            this.handleHttpError(error as AxiosError, 'GET', url);
        }
    }

    /**
     * Perform HTTP POST request with timeout
     */
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await axios.post(url, data, { ...this.config, ...config });
            return response.data;
        } catch (error) {
            this.handleHttpError(error as AxiosError, 'POST', url);
        }
    }

    /**
     * Handle HTTP errors with proper logging and exceptions
     */
    private handleHttpError(error: AxiosError, method: string, url: string): never {
        if (error.code === 'ECONNABORTED') {
            this.logger.error(`OAuth API timeout: ${method} ${url}`, error.stack || '', 'OAuthHttpClient');
            throw new InternalServerErrorException('Authentication service timeout');
        }

        this.logger.error(
            `OAuth HTTP error: ${method} ${url} - ${error.message}`,
            error.stack || '',
            'OAuthHttpClient'
        );
        
        throw error;
    }
}
