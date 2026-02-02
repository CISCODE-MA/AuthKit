/**
 * Logging severity levels
 */
export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

/**
 * Logger service interface for consistent logging across the application
 */
export interface ILoggerService {
  /**
   * Log an informational message
   * @param message - Message to log
   * @param context - Optional context identifier
   */
  log(message: string, context?: string): void;

  /**
   * Log an error message with optional stack trace
   * @param message - Error message
   * @param trace - Stack trace
   * @param context - Optional context identifier
   */
  error(message: string, trace?: string, context?: string): void;

  /**
   * Log a warning message
   * @param message - Warning message
   * @param context - Optional context identifier
   */
  warn(message: string, context?: string): void;

  /**
   * Log a debug message
   * @param message - Debug message
   * @param context - Optional context identifier
   */
  debug(message: string, context?: string): void;

  /**
   * Log a verbose message
   * @param message - Verbose message
   * @param context - Optional context identifier
   */
  verbose(message: string, context?: string): void;
}
