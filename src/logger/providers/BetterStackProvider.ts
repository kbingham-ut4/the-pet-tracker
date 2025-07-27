import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogEntry, LoggerProvider } from '../types';

export interface BetterStackProviderConfig {
  /**
   * BetterStack source token
   */
  sourceToken: string;

  /**
   * API endpoint URL
   */
  endpoint?: string;

  /**
   * Batch size for sending logs
   */
  batchSize?: number;

  /**
   * Flush interval in milliseconds
   */
  flushInterval?: number;

  /**
   * Maximum number of retries for failed requests
   */
  maxRetries?: number;

  /**
   * Enable/disable the provider
   */
  enabled?: boolean;
}

/**
 * BetterStack provider for remote log aggregation
 * Features: batching, retry logic, offline storage
 */
export class BetterStackProvider implements LoggerProvider {
  readonly name = 'betterstack';
  readonly supportsBatching = true;

  private config: Required<BetterStackProviderConfig>;
  private logBuffer: LogEntry[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private isNetworkAvailable = true;
  private isInitialized = false;

  constructor(config: BetterStackProviderConfig) {
    this.config = {
      endpoint: 'https://in.logs.betterstack.com/',
      batchSize: 10,
      flushInterval: 5000,
      maxRetries: 3,
      enabled: true,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled || !this.config.sourceToken) {
      return;
    }

    this.isInitialized = true;

    // Start periodic flush timer
    this.flushTimer = setInterval(() => {
      this.flush().catch(() => {
        // Silent failure - logging shouldn't break the app
      });
    }, this.config.flushInterval);

    // Retry failed logs periodically
    setInterval(() => {
      this.retryFailedLogs().catch(() => {
        // Silent failure
      });
    }, 30000); // Retry every 30 seconds
  }

  log(entry: LogEntry): void {
    if (!this.config.enabled || !this.isInitialized) {
      return;
    }

    this.logBuffer.push(entry);

    // Immediate flush for errors or when buffer is full
    if (entry.level === 'error' || this.logBuffer.length >= this.config.batchSize) {
      this.flush().catch(() => {
        // Silent failure
      });
    }
  }

  logBatch(entries: LogEntry[]): void {
    if (!this.config.enabled || !this.isInitialized) {
      return;
    }

    this.logBuffer.push(...entries);

    if (this.logBuffer.length >= this.config.batchSize) {
      this.flush().catch(() => {
        // Silent failure
      });
    }
  }

  async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    await this.shipToBetterStack(logsToSend);
  }

  async cleanup(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Final flush
    await this.flush();
  }

  /**
   * Ships logs to BetterStack via HTTP
   */
  private async shipToBetterStack(logs: LogEntry[]): Promise<void> {
    if (!this.config.enabled || logs.length === 0) {
      return;
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.sourceToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'PetTracker/1.0.0',
        },
        body: JSON.stringify(logs),
      });

      if (!response.ok) {
        throw new Error(`BetterStack HTTP ${response.status}: ${response.statusText}`);
      }

      this.isNetworkAvailable = true;

      // Clear failed logs on successful send
      await AsyncStorage.removeItem('pet_tracker_failed_logs');
    } catch (error) {
      this.isNetworkAvailable = false;

      // Store failed logs for retry
      await this.storeFailedLogs(logs);

      // Only log network errors in development
      if (__DEV__) {
        console.warn('BetterStack shipping failed:', error);
      }
    }
  }

  /**
   * Stores failed logs for later retry
   */
  private async storeFailedLogs(logs: LogEntry[]): Promise<void> {
    try {
      const existingFailedLogs = await AsyncStorage.getItem('pet_tracker_failed_logs');
      const failedLogs: LogEntry[] = existingFailedLogs ? JSON.parse(existingFailedLogs) : [];

      failedLogs.push(...logs);

      // Limit to prevent storage bloat (keep last 500 failed logs)
      if (failedLogs.length > 500) {
        failedLogs.splice(0, failedLogs.length - 500);
      }

      await AsyncStorage.setItem('pet_tracker_failed_logs', JSON.stringify(failedLogs));
    } catch {
      // Silent failure - can't do much if AsyncStorage fails
    }
  }

  /**
   * Retries sending previously failed logs
   */
  private async retryFailedLogs(): Promise<void> {
    if (!this.isNetworkAvailable) {
      return;
    }

    try {
      const failedLogsJson = await AsyncStorage.getItem('pet_tracker_failed_logs');
      if (!failedLogsJson) {
        return;
      }

      const failedLogs: LogEntry[] = JSON.parse(failedLogsJson);
      if (failedLogs.length === 0) {
        return;
      }

      // Process in batches to avoid overwhelming the API
      const batchSize = this.config.batchSize;
      for (let i = 0; i < failedLogs.length; i += batchSize) {
        const batch = failedLogs.slice(i, i + batchSize);
        await this.shipToBetterStack(batch);
      }
    } catch {
      // Silent failure
    }
  }
}
