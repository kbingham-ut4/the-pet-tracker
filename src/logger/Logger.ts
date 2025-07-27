import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogLevel, LogContext, LogEntry, LoggerProvider } from './types';

/**
 * Main Logger class that uses a provider-based architecture
 * Supports multiple output destinations through configurable providers
 */
export class Logger {
  private readonly logLevels = { debug: 20, info: 30, warn: 40, error: 50 };
  private readonly minLevel = __DEV__ ? 20 : 30; // debug in dev, info+ in prod
  private readonly appVersion = '1.0.0';
  private readonly environment = __DEV__ ? 'development' : 'production';

  private providers: LoggerProvider[] = [];

  /**
   * Add a logging provider
   */
  addProvider(provider: LoggerProvider): void {
    this.providers.push(provider);
  }

  /**
   * Remove a logging provider
   */
  removeProvider(provider: LoggerProvider): void {
    const index = this.providers.indexOf(provider);
    if (index > -1) {
      this.providers.splice(index, 1);
    }
  }

  /**
   * Formats a log entry with Pino-compatible structure
   */
  private formatLogEntry(level: LogLevel, msg: string, context?: LogContext): LogEntry {
    return {
      level,
      time: Date.now(),
      msg,
      appVersion: this.appVersion,
      platform: 'mobile',
      environment: this.environment,
      pid: 1, // React Native doesn't have process.pid
      hostname: 'mobile-app',
      ...(context && { context }),
    };
  }

  /**
   * Core logging method with level filtering and provider dispatch
   */
  private log(level: LogLevel, msg: string, context?: LogContext): void {
    // Level filtering
    if (this.logLevels[level] < this.minLevel) {
      return;
    }

    const entry = this.formatLogEntry(level, msg, context);

    // Send to all providers
    this.providers.forEach(provider => {
      try {
        provider.log(entry);
      } catch (error) {
        // Silent failure - logging shouldn't break the app
        // In dev, we might want to know if a provider fails
        if (__DEV__) {
          console.warn(`Logger provider failed:`, error);
        }
      }
    });
  }

  /**
   * Debug level logging - verbose information for development
   */
  debug = (msg: string, context?: LogContext): void => {
    this.log('debug', msg, context);
  };

  /**
   * Info level logging - general application flow and important events
   */
  info = (msg: string, context?: LogContext): void => {
    this.log('info', msg, context);
  };

  /**
   * Warning level logging - potentially harmful situations
   */
  warn = (msg: string, context?: LogContext): void => {
    this.log('warn', msg, context);
  };

  /**
   * Error level logging - error events that might still allow the app to continue
   */
  error = (msg: string, context?: LogContext): void => {
    this.log('error', msg, context);
  };

  /**
   * Creates a child logger with bound context (Pino-style)
   * Useful for component-specific or feature-specific logging
   */
  child(bindings: LogContext) {
    return {
      debug: (msg: string, context?: LogContext) => this.debug(msg, { ...bindings, ...context }),
      info: (msg: string, context?: LogContext) => this.info(msg, { ...bindings, ...context }),
      warn: (msg: string, context?: LogContext) => this.warn(msg, { ...bindings, ...context }),
      error: (msg: string, context?: LogContext) => this.error(msg, { ...bindings, ...context }),
    };
  }

  /**
   * Manually flush buffered logs (for providers that support it)
   */
  async flushLogs(): Promise<void> {
    const flushPromises = this.providers
      .filter(provider => 'flush' in provider)
      .map(provider => (provider as unknown as { flush(): Promise<void> }).flush());

    await Promise.allSettled(flushPromises);
  }

  /**
   * Retrieves locally stored logs for debugging or support
   * This is a legacy method - in the new architecture, providers handle their own storage
   */
  async getLogs(): Promise<LogEntry[]> {
    try {
      const logs = await AsyncStorage.getItem('pet_tracker_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      this.warn('Failed to retrieve stored logs', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Clears all locally stored logs
   * This is a legacy method - in the new architecture, providers handle their own storage
   */
  async clearLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem('pet_tracker_logs');
      await AsyncStorage.removeItem('pet_tracker_failed_logs');
      this.info('Local logs cleared successfully');
    } catch (error) {
      this.warn('Failed to clear local logs', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Gets statistics about stored logs
   * This is a legacy method - in the new architecture, providers handle their own storage
   */
  async getLogStats(): Promise<{
    localCount: number;
    failedCount: number;
    oldestLog: number | null;
    newestLog: number | null;
  }> {
    try {
      const [localLogs, failedLogs] = await Promise.all([
        this.getLogs(),
        AsyncStorage.getItem('pet_tracker_failed_logs').then(data =>
          data ? JSON.parse(data) : []
        ),
      ]);

      return {
        localCount: localLogs.length,
        failedCount: failedLogs.length,
        oldestLog: localLogs.length > 0 ? localLogs[0].time : null,
        newestLog: localLogs.length > 0 ? localLogs[localLogs.length - 1].time : null,
      };
    } catch {
      return {
        localCount: 0,
        failedCount: 0,
        oldestLog: null,
        newestLog: null,
      };
    }
  }

  /**
   * Cleanup method - call when app is closing or backgrounding
   */
  async cleanup(): Promise<void> {
    const cleanupPromises = this.providers
      .filter(provider => 'cleanup' in provider)
      .map(provider => (provider as unknown as { cleanup(): Promise<void> }).cleanup());

    await Promise.allSettled(cleanupPromises);
  }
}
