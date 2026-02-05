/**
 * Facebook OAuth Provider
 * 
 * Handles Facebook OAuth authentication via access token validation.
 * Uses Facebook's debug token API to verify token authenticity.
 */

import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoggerService } from '@services/logger.service';
import { OAuthProfile } from '../oauth.types';
import { IOAuthProvider } from './oauth-provider.interface';
import { OAuthHttpClient } from '../utils/oauth-http.client';
import { OAuthErrorHandler } from '../utils/oauth-error.handler';

@Injectable()
export class FacebookOAuthProvider implements IOAuthProvider {
    private readonly httpClient: OAuthHttpClient;
    private readonly errorHandler: OAuthErrorHandler;

    constructor(private readonly logger: LoggerService) {
        this.httpClient = new OAuthHttpClient(logger);
        this.errorHandler = new OAuthErrorHandler(logger);
    }

    // #region Access Token Validation

    /**
     * Verify Facebook access token and extract user profile
     * 
     * @param accessToken - Facebook access token from client
     */
    async verifyAndExtractProfile(accessToken: string): Promise<OAuthProfile> {
        try {
            // Step 1: Get app access token for validation
            const appAccessToken = await this.getAppAccessToken();

            // Step 2: Validate user's access token
            await this.validateAccessToken(accessToken, appAccessToken);

            // Step 3: Fetch user profile
            const profileData = await this.httpClient.get('https://graph.facebook.com/me', {
                params: {
                    access_token: accessToken,
                    fields: 'id,name',
                },
            });

            // Use Facebook ID as email fallback for testing
            const email = profileData.email || `${profileData.id}@facebook.test`;

            return {
                email: email,
                name: profileData.name,
                providerId: profileData.id,
            };
        } catch (error) {
            this.errorHandler.handleProviderError(error, 'Facebook', 'access token verification');
        }
    }

    // #endregion

    // #region Private Helper Methods

    /**
     * Get Facebook app access token for token validation
     */
    private async getAppAccessToken(): Promise<string> {
        const data = await this.httpClient.get('https://graph.facebook.com/oauth/access_token', {
            params: {
                client_id: process.env.FB_CLIENT_ID,
                client_secret: process.env.FB_CLIENT_SECRET,
                grant_type: 'client_credentials',
            },
        });

        if (!data.access_token) {
            this.logger.error('Failed to get Facebook app token', '', 'FacebookOAuthProvider');
            throw new InternalServerErrorException('Failed to get Facebook app token');
        }

        return data.access_token;
    }

    /**
     * Validate user's access token using Facebook's debug API
     */
    private async validateAccessToken(userToken: string, appToken: string): Promise<void> {
        const debugData = await this.httpClient.get('https://graph.facebook.com/debug_token', {
            params: {
                input_token: userToken,
                access_token: appToken,
            },
        });

        if (!debugData.data?.is_valid) {
            throw new UnauthorizedException('Invalid Facebook access token');
        }
    }

    // #endregion
}
