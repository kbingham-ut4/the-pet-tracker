/* eslint-disable no-console */
import { LoggingProvider, LogEntry } from '../types';

export class ConsoleProvider implements LoggingProvider {
  name = 'console';
  private appName: string;
  private enableColors: boolean;

  constructor(appName = 'PetTracker', enableColors = true) {
    this.appName = appName;
    this.enableColors = enableColors;
  }

  initialize(): void {
    // Console provider doesn't need initialization
  }

  log(entry: LogEntry): void {
    const { timestamp, level, message, args = [], context } = entry;

    const prefix = `[${timestamp.toISOString()}] [${level.toUpperCase()}] [${this.appName}]`;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';

    const logMessage = `${prefix} ${message}${contextStr}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, ...args);
        break;
      case 'info':
        console.info(logMessage, ...args);
        break;
      case 'warn':
        console.warn(logMessage, ...args);
        break;
      case 'error':
        console.error(logMessage, ...args);
        if (entry.error) {
          console.error('Error details:', entry.error);
        }
        break;
    }
  }

  flush(): void {
    // Console doesn't need flushing
  }

  destroy(): void {
    // Console doesn't need cleanup
  }
}
