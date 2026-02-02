/**
 * OAuth Provider Interface
 * 
 * Common interface that all OAuth providers must implement.
 * This ensures consistency across different OAuth implementations.
 */

import { OAuthProfile } from '../oauth.types';

/**
 * Base interface for OAuth providers
 */
export interface IOAuthProvider {
    /**
     * Verify OAuth token/code and extract user profile
     * 
     * @param token - OAuth token or authorization code
     * @returns User profile information
     * @throws UnauthorizedException if token is invalid
     * @throws BadRequestException if required fields are missing
     */
    verifyAndExtractProfile(token: string): Promise<OAuthProfile>;
}
