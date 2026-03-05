/**
 * OAuth Provider Interface
<<<<<<< HEAD
 * 
=======
 *
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
 * Common interface that all OAuth providers must implement.
 * This ensures consistency across different OAuth implementations.
 */

<<<<<<< HEAD
import { OAuthProfile } from '../oauth.types';
=======
import type { OAuthProfile } from "../oauth.types";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Base interface for OAuth providers
 */
export interface IOAuthProvider {
<<<<<<< HEAD
    /**
     * Verify OAuth token/code and extract user profile
     * 
     * @param token - OAuth token or authorization code
     * @returns User profile information
     * @throws UnauthorizedException if token is invalid
     * @throws BadRequestException if required fields are missing
     */
    verifyAndExtractProfile(token: string): Promise<OAuthProfile>;
=======
  /**
   * Verify OAuth token/code and extract user profile
   *
   * @param token - OAuth token or authorization code
   * @returns User profile information
   * @throws UnauthorizedException if token is invalid
   * @throws BadRequestException if required fields are missing
   */
  verifyAndExtractProfile(token: string): Promise<OAuthProfile>;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
}
