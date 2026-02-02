/**
 * OAuth Service (Refactored)
 * 
 * Main orchestrator for OAuth authentication flows.
 * Delegates provider-specific logic to specialized provider classes.
 * 
 * Responsibilities:
 * - Route OAuth requests to appropriate providers
 * - Handle user creation/lookup for OAuth users
 * - Issue authentication tokens
 */

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '@repos/user.repository';
import { RoleRepository } from '@repos/role.repository';
import { AuthService } from '@services/auth.service';
import { LoggerService } from '@services/logger.service';
import { GoogleOAuthProvider } from './oauth/providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from './oauth/providers/microsoft-oauth.provider';
import { FacebookOAuthProvider } from './oauth/providers/facebook-oauth.provider';
import { OAuthProfile, OAuthTokens } from './oauth/oauth.types';

@Injectable()
export class OAuthService {
    // OAuth providers
    private readonly googleProvider: GoogleOAuthProvider;
    private readonly microsoftProvider: MicrosoftOAuthProvider;
    private readonly facebookProvider: FacebookOAuthProvider;

    constructor(
        private readonly users: UserRepository,
        private readonly roles: RoleRepository,
        private readonly auth: AuthService,
        private readonly logger: LoggerService,
    ) {
        // Initialize providers
        this.googleProvider = new GoogleOAuthProvider(logger);
        this.microsoftProvider = new MicrosoftOAuthProvider(logger);
        this.facebookProvider = new FacebookOAuthProvider(logger);
    }

    // #region Google OAuth Methods

    /**
     * Authenticate user with Google ID token
     * 
     * @param idToken - Google ID token from client
     * @returns Authentication tokens (access + refresh)
     */
    async loginWithGoogleIdToken(idToken: string): Promise<OAuthTokens> {
        const profile = await this.googleProvider.verifyAndExtractProfile(idToken);
        return this.findOrCreateOAuthUserFromProfile(profile);
    }

    /**
     * Authenticate user with Google authorization code
     * 
     * @param code - Authorization code from Google OAuth redirect
     * @returns Authentication tokens (access + refresh)
     */
    async loginWithGoogleCode(code: string): Promise<OAuthTokens> {
        const profile = await this.googleProvider.exchangeCodeForProfile(code);
        return this.findOrCreateOAuthUserFromProfile(profile);
    }

    // #endregion

    // #region Microsoft OAuth Methods

    /**
     * Authenticate user with Microsoft ID token
     * 
     * @param idToken - Microsoft/Azure AD ID token from client
     * @returns Authentication tokens (access + refresh)
     */
    async loginWithMicrosoft(idToken: string): Promise<OAuthTokens> {
        const profile = await this.microsoftProvider.verifyAndExtractProfile(idToken);
        return this.findOrCreateOAuthUserFromProfile(profile);
    }

    // #endregion

    // #region Facebook OAuth Methods

    /**
     * Authenticate user with Facebook access token
     * 
     * @param accessToken - Facebook access token from client
     * @returns Authentication tokens (access + refresh)
     */
    async loginWithFacebook(accessToken: string): Promise<OAuthTokens> {
        const profile = await this.facebookProvider.verifyAndExtractProfile(accessToken);
        return this.findOrCreateOAuthUserFromProfile(profile);
    }

    // #endregion

    // #region User Management (Public API)

    /**
     * Find or create OAuth user from email and name (for Passport strategies)
     * 
     * @param email - User's email address
     * @param name - User's full name (optional)
     * @returns Authentication tokens for the user
     */
    async findOrCreateOAuthUser(email: string, name?: string): Promise<OAuthTokens> {
        const profile: OAuthProfile = { email, name };
        return this.findOrCreateOAuthUserFromProfile(profile);
    }

    // #endregion

    // #region User Management (Private)

    /**
     * Find existing user or create new one from OAuth profile
     * 
     * Handles race conditions where multiple requests might try to create
     * the same user simultaneously (duplicate key error).
     * 
     * @param profile - OAuth user profile (email, name, etc.)
     * @returns Authentication tokens for the user
     */
    private async findOrCreateOAuthUserFromProfile(profile: OAuthProfile): Promise<OAuthTokens> {
        try {
            // Try to find existing user
            let user = await this.users.findByEmail(profile.email);

            // Create new user if not found
            if (!user) {
                user = await this.createOAuthUser(profile);
            }

            // Issue authentication tokens
            const { accessToken, refreshToken } = await this.auth.issueTokensForUser(
                user._id.toString()
            );

            return { accessToken, refreshToken };
        } catch (error) {
            // Handle race condition: user created between check and insert
            if (error?.code === 11000) {
                return this.handleDuplicateUserCreation(profile.email);
            }

            this.logger.error(
                `OAuth user creation/login failed: ${error.message}`,
                error.stack,
                'OAuthService'
            );
            throw new InternalServerErrorException('Authentication failed');
        }
    }

    /**
     * Create new user from OAuth profile
     */
    private async createOAuthUser(profile: OAuthProfile) {
        const [fname, ...rest] = (profile.name || 'User OAuth').split(' ');
        const lname = rest.join(' ') || 'OAuth';

        const defaultRoleId = await this.getDefaultRoleId();

        return this.users.create({
            fullname: { fname, lname },
            username: profile.email.split('@')[0],
            email: profile.email,
            roles: [defaultRoleId],
            isVerified: true,
            isBanned: false,
            passwordChangedAt: new Date(),
        });
    }

    /**
     * Handle duplicate user creation (race condition)
     * Retry finding the user that was just created
     */
    private async handleDuplicateUserCreation(email: string): Promise<OAuthTokens> {
        try {
            const user = await this.users.findByEmail(email);
            if (user) {
                const { accessToken, refreshToken } = await this.auth.issueTokensForUser(
                    user._id.toString()
                );
                return { accessToken, refreshToken };
            }
        } catch (retryError) {
            this.logger.error(
                `OAuth user retry failed: ${retryError.message}`,
                retryError.stack,
                'OAuthService'
            );
        }

        throw new InternalServerErrorException('Authentication failed');
    }

    /**
     * Get default role ID for new OAuth users
     */
    private async getDefaultRoleId() {
        const role = await this.roles.findByName('user');
        if (!role) {
            this.logger.error('Default user role not found - seed data missing', '', 'OAuthService');
            throw new InternalServerErrorException('System configuration error');
        }
        return role._id;
    }

    // #endregion
}
