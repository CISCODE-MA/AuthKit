/**
 * Google OAuth Provider
 * 
 * Handles Google OAuth authentication via:
 * - ID Token verification
 * - Authorization code exchange
 */

import { Injectable } from '@nestjs/common';
import { LoggerService } from '@services/logger.service';
import { OAuthProfile } from '../oauth.types';
import { IOAuthProvider } from './oauth-provider.interface';
import { OAuthHttpClient } from '../utils/oauth-http.client';
import { OAuthErrorHandler } from '../utils/oauth-error.handler';

@Injectable()
export class GoogleOAuthProvider implements IOAuthProvider {
    private readonly httpClient: OAuthHttpClient;
    private readonly errorHandler: OAuthErrorHandler;

    constructor(private readonly logger: LoggerService) {
        this.httpClient = new OAuthHttpClient(logger);
        this.errorHandler = new OAuthErrorHandler(logger);
    }

    // #region ID Token Verification

    /**
     * Verify Google ID token and extract user profile
     * 
     * @param idToken - Google ID token from client
     */
    async verifyAndExtractProfile(idToken: string): Promise<OAuthProfile> {
        try {
            const data = await this.httpClient.get('https://oauth2.googleapis.com/tokeninfo', {
                params: { id_token: idToken },
            });

            this.errorHandler.validateRequiredField(data.email, 'Email', 'Google');

            return {
                email: data.email,
                name: data.name,
                providerId: data.sub,
            };
        } catch (error) {
            this.errorHandler.handleProviderError(error, 'Google', 'ID token verification');
        }
    }

    // #endregion

    // #region Authorization Code Flow

    /**
     * Exchange authorization code for tokens and get user profile
     * 
     * @param code - Authorization code from Google OAuth redirect
     */
    async exchangeCodeForProfile(code: string): Promise<OAuthProfile> {
        try {
            // Exchange code for access token
            const tokenData = await this.httpClient.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code',
            });

            this.errorHandler.validateRequiredField(tokenData.access_token, 'Access token', 'Google');

            // Get user profile with access token
            const profileData = await this.httpClient.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });

            this.errorHandler.validateRequiredField(profileData.email, 'Email', 'Google');

            return {
                email: profileData.email,
                name: profileData.name,
                providerId: profileData.id,
            };
        } catch (error) {
            this.errorHandler.handleProviderError(error, 'Google', 'code exchange');
        }
    }

    // #endregion
}
