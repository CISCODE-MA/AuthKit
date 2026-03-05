/**
 * Mail service interface for sending emails
 */
export interface IMailService {
  /**
   * Send email verification token to user
   * @param email - Recipient email address
   * @param token - Verification token
   */
  sendVerificationEmail(email: string, token: string): Promise<void>;

  /**
   * Send password reset token to user
   * @param email - Recipient email address
   * @param token - Reset token
   */
  sendResetPasswordEmail(email: string, token: string): Promise<void>;

  /**
   * Send welcome email to new user
   * @param email - Recipient email address
   * @param name - User name
   */
  sendWelcomeEmail(email: string, name: string): Promise<void>;
}
