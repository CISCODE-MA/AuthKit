/**
 * Microsoft OAuth Provider
 * 
 * Handles Microsoft/Azure AD OAuth authentication via ID token verification.
 * Uses JWKS (JSON Web Key Set) for token signature validation.
 */

import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { LoggerService } from '@services/logger.service';
import { OAuthProfile } from '../oauth.types';
import { IOAuthProvider } from './oauth-provider.interface';
import { OAuthErrorHandler } from '../utils/oauth-error.handler';

@Injectable()
export class MicrosoftOAuthProvider implements IOAuthProvider {
    private readonly errorHandler: OAuthErrorHandler;
    
    /**
     * JWKS client for fetching Microsoft's public keys
     */
    private readonly jwksClient = jwksClient({
        jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
    });

    constructor(private readonly logger: LoggerService) {
        this.errorHandler = new OAuthErrorHandler(logger);
    }

    // #region ID Token Verification

    /**
     * Verify Microsoft ID token and extract user profile
     * 
     * @param idToken - Microsoft/Azure AD ID token from client
     */
    async verifyAndExtractProfile(idToken: string): Promise<OAuthProfile> {
        try {
            const payload = await this.verifyIdToken(idToken);
            
            // Extract email (Microsoft uses 'preferred_username' or 'email')
            const email = payload.preferred_username || payload.email;
            this.errorHandler.validateRequiredField(email, 'Email', 'Microsoft');

            return {
                email,
                name: payload.name,
                providerId: payload.oid || payload.sub,
            };
        } catch (error) {
            this.errorHandler.handleProviderError(error, 'Microsoft', 'ID token verification');
        }
    }

    /**
     * Verify Microsoft ID token signature using JWKS
     * 
     * @param idToken - The ID token to verify
     * @returns Decoded token payload
     */
    private verifyIdToken(idToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            // Callback to get signing key
            const getKey = (header: any, callback: (err: any, key?: string) => void) => {
                this.jwksClient
                    .getSigningKey(header.kid)
                    .then((key) => callback(null, key.getPublicKey()))
                    .catch((err) => {
                        this.logger.error(
                            `Failed to get Microsoft signing key: ${err.message}`,
                            err.stack,
                            'MicrosoftOAuthProvider'
                        );
                        callback(err);
                    });
            };

            // Verify token with fetched key
            jwt.verify(
                idToken,
                getKey as any,
                {
                    algorithms: ['RS256'],
                    audience: process.env.MICROSOFT_CLIENT_ID,
                },
                (err, payload) => {
                    if (err) {
                        this.logger.error(
                            `Microsoft token verification failed: ${err.message}`,
                            err.stack,
                            'MicrosoftOAuthProvider'
                        );
                        reject(err);
                    } else {
                        resolve(payload);
                    }
                }
            );
        });
    }

    // #endregion
}
