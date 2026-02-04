/**
 * Standardized error codes for Auth Kit
 * Used across all error responses for consistent error handling
 */
export enum AuthErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'AUTH_001',
  EMAIL_NOT_VERIFIED = 'AUTH_002',
  ACCOUNT_BANNED = 'AUTH_003',
  INVALID_TOKEN = 'AUTH_004',
  TOKEN_EXPIRED = 'AUTH_005',
  REFRESH_TOKEN_MISSING = 'AUTH_006',
  UNAUTHORIZED = 'AUTH_007',

  // Registration errors
  EMAIL_EXISTS = 'REG_001',
  USERNAME_EXISTS = 'REG_002',
  PHONE_EXISTS = 'REG_003',
  CREDENTIALS_EXIST = 'REG_004',

  // User management errors
  USER_NOT_FOUND = 'USER_001',
  USER_ALREADY_VERIFIED = 'USER_002',

  // Role & Permission errors
  ROLE_NOT_FOUND = 'ROLE_001',
  ROLE_EXISTS = 'ROLE_002',
  PERMISSION_NOT_FOUND = 'PERM_001',
  PERMISSION_EXISTS = 'PERM_002',
  DEFAULT_ROLE_MISSING = 'ROLE_003',

  // Password errors
  INVALID_PASSWORD = 'PWD_001',
  PASSWORD_RESET_FAILED = 'PWD_002',

  // Email errors
  EMAIL_SEND_FAILED = 'EMAIL_001',
  VERIFICATION_FAILED = 'EMAIL_002',

  // OAuth errors
  OAUTH_INVALID_TOKEN = 'OAUTH_001',
  OAUTH_GOOGLE_FAILED = 'OAUTH_002',
  OAUTH_MICROSOFT_FAILED = 'OAUTH_003',
  OAUTH_FACEBOOK_FAILED = 'OAUTH_004',

  // System errors
  SYSTEM_ERROR = 'SYS_001',
  CONFIG_ERROR = 'SYS_002',
  DATABASE_ERROR = 'SYS_003',
}

/**
 * Structured error response interface
 */
export interface StructuredError {
  /** HTTP status code */
  statusCode: number;
  /** Error code for programmatic handling */
  code: AuthErrorCode;
  /** Human-readable error message */
  message: string;
  /** Optional additional details */
  details?: Record<string, any>;
  /** Timestamp of error */
  timestamp: string;
}

/**
 * Helper to create structured error responses
 * @param code - Error code from AuthErrorCode enum
 * @param message - Human-readable error message
 * @param statusCode - HTTP status code
 * @param details - Optional additional error details
 * @returns Structured error object
 */
export function createStructuredError(
  code: AuthErrorCode,
  message: string,
  statusCode: number,
  details?: Record<string, any>,
): StructuredError {
  return {
    statusCode,
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Error code to HTTP status mapping
 */
export const ErrorCodeToStatus: Record<string, number> = {
  // 400 Bad Request
  [AuthErrorCode.INVALID_PASSWORD]: 400,
  [AuthErrorCode.INVALID_TOKEN]: 400,
  [AuthErrorCode.OAUTH_INVALID_TOKEN]: 400,
  
  // 401 Unauthorized
  [AuthErrorCode.INVALID_CREDENTIALS]: 401,
  [AuthErrorCode.TOKEN_EXPIRED]: 401,
  [AuthErrorCode.UNAUTHORIZED]: 401,
  [AuthErrorCode.REFRESH_TOKEN_MISSING]: 401,
  
  // 403 Forbidden
  [AuthErrorCode.EMAIL_NOT_VERIFIED]: 403,
  [AuthErrorCode.ACCOUNT_BANNED]: 403,
  
  // 404 Not Found
  [AuthErrorCode.USER_NOT_FOUND]: 404,
  [AuthErrorCode.ROLE_NOT_FOUND]: 404,
  [AuthErrorCode.PERMISSION_NOT_FOUND]: 404,
  
  // 409 Conflict
  [AuthErrorCode.EMAIL_EXISTS]: 409,
  [AuthErrorCode.USERNAME_EXISTS]: 409,
  [AuthErrorCode.PHONE_EXISTS]: 409,
  [AuthErrorCode.CREDENTIALS_EXIST]: 409,
  [AuthErrorCode.USER_ALREADY_VERIFIED]: 409,
  [AuthErrorCode.ROLE_EXISTS]: 409,
  [AuthErrorCode.PERMISSION_EXISTS]: 409,
  
  // 500 Internal Server Error
  [AuthErrorCode.SYSTEM_ERROR]: 500,
  [AuthErrorCode.CONFIG_ERROR]: 500,
  [AuthErrorCode.DATABASE_ERROR]: 500,
  [AuthErrorCode.EMAIL_SEND_FAILED]: 500,
  [AuthErrorCode.VERIFICATION_FAILED]: 500,
  [AuthErrorCode.PASSWORD_RESET_FAILED]: 500,
  [AuthErrorCode.DEFAULT_ROLE_MISSING]: 500,
  [AuthErrorCode.OAUTH_GOOGLE_FAILED]: 500,
  [AuthErrorCode.OAUTH_MICROSOFT_FAILED]: 500,
  [AuthErrorCode.OAUTH_FACEBOOK_FAILED]: 500,
};
