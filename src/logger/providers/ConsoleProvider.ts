import { LogEntry, LoggerProvider } from '../types';

export interface ConsoleProviderConfig {
  /**
   * Whether to use pretty formatting (development) or JSON (production)
   */
  prettyPrint?: boolean;

  /**
   * Colors configuration for pretty printing
   */
  colors?: {
    debug?: string;
    info?: string;
    warn?: string;
    error?: string;
  };
}

/**
 * Console logger provider for development and basic logging
 * Outputs logs to the console with optional pretty formatting
 */
export class ConsoleProvider implements LoggerProvider {
  readonly name = 'console';
  readonly supportsBatching = false;

  private config: ConsoleProviderConfig = {};

  constructor(config: ConsoleProviderConfig = {}) {
    this.config = {
      prettyPrint: __DEV__,
      colors: {
        debug: 'gray',
        info: 'blue',
        warn: 'yellow',
        error: 'red',
      },
      ...config,
    };
  }

  initialize(): void {
    // Console provider doesn't need initialization
  }

  log(entry: LogEntry): void {
    if (this.config.prettyPrint) {
      this.logPretty(entry);
    } else {
      this.logJson(entry);
    }
  }

  private logPretty(entry: LogEntry): void {
    const timestamp = new Date(entry.time).toISOString();
    const levelStr = entry.level.toUpperCase().padEnd(5);
    const contextStr = entry.context ? `\n${JSON.stringify(entry.context, null, 2)}` : '';

    const logMethod = this.getConsoleMethod(entry.level);
    logMethod(`[${timestamp}] [${levelStr}] [PetTracker] ${entry.msg}${contextStr}`);
  }

  private logJson(entry: LogEntry): void {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  }

  private getConsoleMethod(level: string): (..._data: unknown[]) => void {
    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        return console.debug;
      case 'info':
        // eslint-disable-next-line no-console
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      default:
        // eslint-disable-next-line no-console
        return console.log;
    }
  }
}
