/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoggerFactory } from './LoggerFactory';
import { Logger } from './Logger';

// Export types
export type { LogLevel, LogEntry, LoggingProvider, LoggerConfig, LoggerOptions } from './types';

// Export classes
export { Logger } from './Logger';
export { LoggerFactory } from './LoggerFactory';

// Export providers
export * from './providers';

// Initialize default logger instance
let defaultLogger: Logger | null = null;
let initializationPromise: Promise<Logger> | null = null;

async function initializeDefaultLogger() {
  if (defaultLogger) {
    return defaultLogger;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = LoggerFactory.createLogger();
  defaultLogger = await initializationPromise;
  return defaultLogger;
}

// Convenience functions that use the default logger
export const debug = async (message: string, ...args: any[]) => {
  const logger = await initializeDefaultLogger();
  logger.debug(message, ...args);
};

export const info = async (message: string, ...args: any[]) => {
  const logger = await initializeDefaultLogger();
  logger.info(message, ...args);
};

export const warn = async (message: string, ...args: any[]) => {
  const logger = await initializeDefaultLogger();
  logger.warn(message, ...args);
};

export const error = async (message: string, ...args: any[]) => {
  const logger = await initializeDefaultLogger();
  logger.error(message, ...args);
};

export const group = async (label: string) => {
  const logger = await initializeDefaultLogger();
  logger.group(label);
};

export const groupEnd = async () => {
  const logger = await initializeDefaultLogger();
  logger.groupEnd();
};

// Synchronous logger getter (returns null-safe logger or creates one)
export const getLogger = (): Logger => {
  if (!defaultLogger) {
    console.warn('Logger not initialized yet, initializing with default configuration...');
    // Initialize with default config synchronously using a fallback
    initializeDefaultLogger().catch(error => {
      console.error('Failed to initialize default logger:', error);
    });

    // Return a temporary logger that queues operations until real logger is ready
    return createTempLogger();
  }
  return defaultLogger;
};

// Temporary logger that queues operations until real logger is initialized
function createTempLogger(): Logger {
  const queuedOperations: Array<() => void> = [];

  const executeWhenReady = (operation: () => void) => {
    if (defaultLogger) {
      operation();
    } else {
      queuedOperations.push(operation);
      // Try to flush queue when logger becomes available
      initializeDefaultLogger().then(() => {
        queuedOperations.forEach(op => {
          try {
            op();
          } catch (error) {
            console.error('Error executing queued log operation:', error);
          }
        });
        queuedOperations.length = 0; // Clear the queue
      });
    }
  };

  return {
    debug: (message: string, options?: any) => {
      executeWhenReady(() => defaultLogger?.debug(message, options));
    },
    info: (message: string, options?: any) => {
      executeWhenReady(() => defaultLogger?.info(message, options));
    },
    warn: (message: string, options?: any) => {
      executeWhenReady(() => defaultLogger?.warn(message, options));
    },
    error: (message: string, options?: any) => {
      executeWhenReady(() => defaultLogger?.error(message, options));
    },
    group: (label: string) => {
      executeWhenReady(() => defaultLogger?.group(label));
    },
    groupEnd: () => {
      executeWhenReady(() => defaultLogger?.groupEnd());
    },
    setUserId: (userId: string) => {
      executeWhenReady(() => defaultLogger?.setUserId(userId));
    },
    setContext: (context: any) => {
      executeWhenReady(() => defaultLogger?.setContext(context));
    },
    destroy: async () => {
      if (defaultLogger) {
        await defaultLogger.destroy();
      }
    },
  } as Logger;
}

// Manual initialization function
export const initializeLogger = async (
  config?: Parameters<typeof LoggerFactory.createLogger>[0]
) => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = LoggerFactory.createLogger(config);
  defaultLogger = await initializationPromise;
  return defaultLogger;
};
