import { RegisterDto } from '@dto/auth/register.dto';
import { LoginDto } from '@dto/auth/login.dto';

/**
 * Authentication tokens response
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Registration result response
 */
export interface RegisterResult {
  ok: boolean;
  id: string;
  email: string;
  emailSent: boolean;
  emailError?: string;
  emailHint?: string;
}

/**
 * Generic operation result
 */
export interface OperationResult {
  ok: boolean;
  message?: string;
  emailSent?: boolean;
  error?: string;
}

/**
 * User profile data
 */
export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  fullname: {
    fname: string;
    lname: string;
  };
  phoneNumber?: string;
  avatar?: string;
  jobTitle?: string;
  company?: string;
  isVerified: boolean;
  isBanned: boolean;
  roles: Array<{
    _id: string;
    name: string;
    permissions: Array<{ _id: string; name: string; description?: string }>;
  }>;
}

/**
 * Authentication service interface
 */
export interface IAuthService {
  /**
   * Register a new user
   * @param dto - Registration data
   * @returns Registration result with user ID and email status
   */
  register(dto: RegisterDto): Promise<RegisterResult>;

  /**
   * Authenticate user with credentials
   * @param dto - Login credentials
   * @returns Authentication tokens
   */
  login(dto: LoginDto): Promise<AuthTokens>;

  /**
   * Refresh authentication token using refresh token
   * @param refreshToken - Valid refresh token
   * @returns New authentication tokens
   */
  refresh(refreshToken: string): Promise<AuthTokens>;

  /**
   * Verify user email with token
   * @param token - Email verification token
   * @returns Operation result with success message
   */
  verifyEmail(token: string): Promise<OperationResult>;

  /**
   * Resend email verification token
   * @param email - User email address
   * @returns Operation result (always succeeds to prevent enumeration)
   */
  resendVerification(email: string): Promise<OperationResult>;

  /**
   * Send password reset email
   * @param email - User email address
   * @returns Operation result (always succeeds to prevent enumeration)
   */
  forgotPassword(email: string): Promise<OperationResult>;

  /**
   * Reset password using token
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Operation result with success message
   */
  resetPassword(token: string, newPassword: string): Promise<OperationResult>;

  /**
   * Get authenticated user profile
   * @param userId - User identifier
   * @returns User profile with roles and permissions
   */
  getMe(userId: string): Promise<UserProfile>;

  /**
   * Delete user account permanently
   * @param userId - User identifier
   * @returns Operation result with success message
   */
  deleteAccount(userId: string): Promise<OperationResult>;
}
