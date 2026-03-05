/**
 * OAuth Service Types and Interfaces
<<<<<<< HEAD
 * 
=======
 *
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
 * Shared types used across OAuth providers and utilities.
 */

/**
 * OAuth user profile extracted from provider
 */
export interface OAuthProfile {
<<<<<<< HEAD
    /** User's email address (required) */
    email: string;
    
    /** User's full name (optional) */
    name?: string;
    
    /** Provider-specific user ID (optional) */
    providerId?: string;
=======
  /** User's email address (required) */
  email: string;

  /** User's full name (optional) */
  name?: string;

  /** Provider-specific user ID (optional) */
  providerId?: string;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}

/**
 * OAuth authentication tokens
 */
export interface OAuthTokens {
<<<<<<< HEAD
    /** JWT access token for API authentication */
    accessToken: string;
    
    /** JWT refresh token for obtaining new access tokens */
    refreshToken: string;
=======
  /** JWT access token for API authentication */
  accessToken: string;

  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}

/**
 * OAuth provider name
 */
export enum OAuthProvider {
<<<<<<< HEAD
    GOOGLE = 'google',
    MICROSOFT = 'microsoft',
    FACEBOOK = 'facebook',
=======
  GOOGLE = "google",
  MICROSOFT = "microsoft",
  FACEBOOK = "facebook",
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
