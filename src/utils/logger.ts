/* eslint-disable @typescript-eslint/no-explicit-any */
// Legacy logger - redirects to new logging system
// @deprecated Use the new logging system from './logging' instead
import { getLogger } from './logging';

// Backward compatibility functions - now use the robust getLogger()
export const debug = (...args: any[]) => {
  const logger = getLogger();
  logger.debug(args[0], ...args.slice(1));
};

export const info = (...args: any[]) => {
  const logger = getLogger();
  logger.info(args[0], ...args.slice(1));
};

export const warn = (...args: any[]) => {
  const logger = getLogger();
  logger.warn(args[0], ...args.slice(1));
};

export const error = (...args: any[]) => {
  const logger = getLogger();
  logger.error(args[0], ...args.slice(1));
};

export const group = (label: string) => {
  const logger = getLogger();
  logger.group(label);
};

export const groupEnd = () => {
  const logger = getLogger();
  logger.groupEnd();
};

// Legacy singleton class for backward compatibility
class Logger {
  private static instance: Logger;

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public debug(...args: any[]): void {
    debug(...args);
  }

  public info(...args: any[]): void {
    info(...args);
  }

  public warn(...args: any[]): void {
    warn(...args);
  }

  public error(...args: any[]): void {
    error(...args);
  }

  public group(label: string): void {
    group(label);
  }

  public groupEnd(): void {
    groupEnd();
  }
}

export const logger = Logger.getInstance();
