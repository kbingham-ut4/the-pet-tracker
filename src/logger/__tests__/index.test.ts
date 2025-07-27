import { describe, it, expect } from 'vitest';
import {
  logger,
  debug,
  info,
  warn,
  error,
  Logger,
  ConsoleProvider,
  BetterStackProvider,
} from '../index';

describe('Logger index', () => {
  describe('exports', () => {
    it('should export logger instance', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should export direct logging functions', () => {
      expect(typeof debug).toBe('function');
      expect(typeof info).toBe('function');
      expect(typeof warn).toBe('function');
      expect(typeof error).toBe('function');
    });

    it('should export Logger class', () => {
      expect(Logger).toBeDefined();
      expect(typeof Logger).toBe('function');
    });

    it('should export provider classes', () => {
      expect(ConsoleProvider).toBeDefined();
      expect(BetterStackProvider).toBeDefined();
    });
  });

  describe('functionality', () => {
    it('should work with direct function imports', () => {
      // Should not throw
      expect(() => {
        info('test message');
      }).not.toThrow();
    });

    it('should work with all logging levels', () => {
      expect(() => {
        debug('debug message');
        info('info message');
        warn('warn message');
        error('error message');
      }).not.toThrow();
    });

    it('should work with logger instance methods', () => {
      expect(() => {
        logger.debug('debug message');
        logger.info('info message');
        logger.warn('warn message');
        logger.error('error message');
      }).not.toThrow();
    });

    it('should support child logger creation', () => {
      const childLogger = logger.child({ component: 'test' });

      expect(childLogger).toBeDefined();
      expect(typeof childLogger.debug).toBe('function');
      expect(typeof childLogger.info).toBe('function');
      expect(typeof childLogger.warn).toBe('function');
      expect(typeof childLogger.error).toBe('function');

      // Should not throw
      expect(() => {
        childLogger.info('child logger test');
      }).not.toThrow();
    });

    it('should support flush and cleanup operations', async () => {
      // Should not throw
      await expect(logger.flushLogs()).resolves.toBeUndefined();
      await expect(logger.cleanup()).resolves.toBeUndefined();
    });
  });

  describe('Logger class instantiation', () => {
    it('should create new Logger instances', () => {
      const customLogger = new Logger();
      expect(customLogger).toBeDefined();
      expect(typeof customLogger.info).toBe('function');
    });

    it('should create provider instances', () => {
      const consoleProvider = new ConsoleProvider();
      expect(consoleProvider).toBeDefined();
      expect(consoleProvider.name).toBe('console');

      const betterStackProvider = new BetterStackProvider({ sourceToken: 'test' });
      expect(betterStackProvider).toBeDefined();
      expect(betterStackProvider.name).toBe('betterstack');
    });

    it('should support custom logger configuration', () => {
      const customLogger = new Logger();
      const consoleProvider = new ConsoleProvider();

      customLogger.addProvider(consoleProvider);

      expect(() => {
        customLogger.info('custom logger test');
      }).not.toThrow();
    });
  });
});
