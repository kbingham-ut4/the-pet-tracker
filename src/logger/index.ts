import { Logger } from './Logger';
import { ConsoleProvider } from './providers/ConsoleProvider';
import { BetterStackProvider } from './providers/BetterStackProvider';
import { LogContext } from './types';

/**
 * Default configured logger instance with appropriate providers
 */
const createDefaultLogger = (): Logger => {
  const logger = new Logger();

  // Always add console provider
  logger.addProvider(new ConsoleProvider());

  // Add BetterStack provider in production if configured
  const betterStackToken = process.env.EXPO_PUBLIC_BETTERSTACK_SOURCE_TOKEN;
  if (!__DEV__ && betterStackToken) {
    logger.addProvider(
      new BetterStackProvider({
        sourceToken: betterStackToken,
        batchSize: 10,
        flushInterval: 5000,
        maxRetries: 3,
      })
    );
  }

  return logger;
};

// Export singleton instance
export const logger = createDefaultLogger();

// Export direct functions for backward compatibility
export const debug = (msg: string, context?: LogContext) => logger.debug(msg, context);
export const info = (msg: string, context?: LogContext) => logger.info(msg, context);
export const warn = (msg: string, context?: LogContext) => logger.warn(msg, context);
export const error = (msg: string, context?: LogContext) => logger.error(msg, context);

// Export classes for custom logger creation
export { Logger } from './Logger';
export { ConsoleProvider } from './providers/ConsoleProvider';
export { BetterStackProvider } from './providers/BetterStackProvider';
export * from './types';
