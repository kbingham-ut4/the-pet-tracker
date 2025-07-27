/**
 * Core logger types and interfaces
 * Defines the contract for all logger providers and log entries
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  time: number;
  msg: string;
  context?: LogContext;
  appVersion: string;
  platform: 'mobile';
  environment: string;
  pid: number;
  hostname: string;
}

export interface LoggerProvider {
  /**
   * Initialize the provider with configuration
   */
  initialize(_config: unknown): Promise<void> | void;

  /**
   * Log a single entry
   */
  log(_entry: LogEntry): Promise<void> | void;

  /**
   * Log multiple entries (for batching)
   */
  logBatch?(_entries: LogEntry[]): Promise<void> | void;

  /**
   * Flush any buffered logs
   */
  flush?(): Promise<void> | void;

  /**
   * Cleanup resources
   */
  cleanup?(): Promise<void> | void;

  /**
   * Provider name for identification
   */
  readonly name: string;

  /**
   * Whether this provider supports batching
   */
  readonly supportsBatching?: boolean;
}

export interface LoggerConfig {
  /**
   * Minimum log level to process
   */
  level: LogLevel;

  /**
   * Application version
   */
  appVersion: string;

  /**
   * Application environment
   */
  environment: string;

  /**
   * Providers to use for logging
   */
  providers: LoggerProvider[];

  /**
   * Global context to include in all logs
   */
  globalContext?: LogContext;
}

export interface ChildLoggerConfig {
  /**
   * Context bindings for this child logger
   */
  bindings: LogContext;
}
