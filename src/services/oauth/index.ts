/**
 * OAuth Module Exports
 * 
 * Barrel file for clean imports of OAuth-related classes.
 */

// Types
export * from './oauth.types';

// Providers
export { GoogleOAuthProvider } from './providers/google-oauth.provider';
export { MicrosoftOAuthProvider } from './providers/microsoft-oauth.provider';
export { FacebookOAuthProvider } from './providers/facebook-oauth.provider';
export { IOAuthProvider } from './providers/oauth-provider.interface';

// Utils
export { OAuthHttpClient } from './utils/oauth-http.client';
export { OAuthErrorHandler } from './utils/oauth-error.handler';
