/**
 * OAuth Service Types and Interfaces
 * 
 * Shared types used across OAuth providers and utilities.
 */

/**
 * OAuth user profile extracted from provider
 */
export interface OAuthProfile {
    /** User's email address (required) */
    email: string;
    
    /** User's full name (optional) */
    name?: string;
    
    /** Provider-specific user ID (optional) */
    providerId?: string;
}

/**
 * OAuth authentication tokens
 */
export interface OAuthTokens {
    /** JWT access token for API authentication */
    accessToken: string;
    
    /** JWT refresh token for obtaining new access tokens */
    refreshToken: string;
}

/**
 * OAuth provider name
 */
export enum OAuthProvider {
    GOOGLE = 'google',
    MICROSOFT = 'microsoft',
    FACEBOOK = 'facebook',
}
