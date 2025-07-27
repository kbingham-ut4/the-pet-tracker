import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '../Logger';
import { ConsoleProvider } from '../providers/ConsoleProvider';
import { BetterStackProvider } from '../providers/BetterStackProvider';

// Mock the providers
vi.mock('../providers/ConsoleProvider');
vi.mock('../providers/BetterStackProvider');

describe('Logger', () => {
  let logger: Logger;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockConsoleProvider: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockBetterStackProvider: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock providers
    mockConsoleProvider = {
      name: 'console',
      log: vi.fn(),
    };

    mockBetterStackProvider = {
      name: 'betterstack',
      log: vi.fn(),
      flush: vi.fn(),
      cleanup: vi.fn(),
    };

    // Mock provider constructors to return our mocks
    vi.mocked(ConsoleProvider).mockImplementation(() => mockConsoleProvider);
    vi.mocked(BetterStackProvider).mockImplementation(() => mockBetterStackProvider);

    logger = new Logger();
  });

  describe('provider management', () => {
    it('should add providers correctly', () => {
      const consoleProvider = new ConsoleProvider();
      logger.addProvider(consoleProvider);

      expect(ConsoleProvider).toHaveBeenCalled();
    });

    it('should remove providers correctly', () => {
      const consoleProvider = new ConsoleProvider();
      logger.addProvider(consoleProvider);
      logger.removeProvider(consoleProvider);

      // Log something to verify provider was removed
      logger.info('test message');
      expect(mockConsoleProvider.log).not.toHaveBeenCalled();
    });

    it('should handle multiple providers', () => {
      const consoleProvider = new ConsoleProvider();
      const betterStackProvider = new BetterStackProvider({ sourceToken: 'test' });

      logger.addProvider(consoleProvider);
      logger.addProvider(betterStackProvider);

      logger.info('test message');

      expect(mockConsoleProvider.log).toHaveBeenCalled();
      expect(mockBetterStackProvider.log).toHaveBeenCalled();
    });
  });

  describe('logging methods', () => {
    beforeEach(() => {
      const consoleProvider = new ConsoleProvider();
      logger.addProvider(consoleProvider);
    });

    it('should log debug messages', () => {
      logger.debug('debug message', { key: 'value' });

      expect(mockConsoleProvider.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
          msg: 'debug message',
          context: { key: 'value' },
        })
      );
    });

    it('should log info messages', () => {
      logger.info('info message');

      expect(mockConsoleProvider.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          msg: 'info message',
        })
      );
    });

    it('should log warning messages', () => {
      logger.warn('warning message');

      expect(mockConsoleProvider.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'warn',
          msg: 'warning message',
        })
      );
    });

    it('should log error messages', () => {
      logger.error('error message');

      expect(mockConsoleProvider.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'error',
          msg: 'error message',
        })
      );
    });

    it('should include required log entry fields', () => {
      logger.info('test message');

      expect(mockConsoleProvider.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          time: expect.any(Number),
          msg: 'test message',
          appVersion: '1.0.0',
          platform: 'mobile',
          environment: expect.any(String),
          pid: 1,
          hostname: 'mobile-app',
        })
      );
    });
  });

  describe('child logger', () => {
    beforeEach(() => {
      const consoleProvider = new ConsoleProvider();
      logger.addProvider(consoleProvider);
    });

    it('should create child logger with bound context', () => {
      const childLogger = logger.child({ userId: '123', component: 'TestComponent' });

      childLogger.info('test message', { action: 'click' });

      expect(mockConsoleProvider.log).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          msg: 'test message',
          context: {
            userId: '123',
            component: 'TestComponent',
            action: 'click',
          },
        })
      );
    });

    it('should merge child context with log context', () => {
      const childLogger = logger.child({ userId: '123' });

      childLogger.error('error occurred', { errorCode: 'E001' });

      expect(mockConsoleProvider.log).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            userId: '123',
            errorCode: 'E001',
          },
        })
      );
    });

    it('should allow log context to override child context', () => {
      const childLogger = logger.child({ userId: '123', source: 'child' });

      childLogger.info('test', { source: 'override' });

      expect(mockConsoleProvider.log).toHaveBeenCalledWith(
        expect.objectContaining({
          context: {
            userId: '123',
            source: 'override',
          },
        })
      );
    });
  });

  describe('level filtering', () => {
    beforeEach(() => {
      const consoleProvider = new ConsoleProvider();
      logger.addProvider(consoleProvider);
    });

    it('should respect log level filtering in development', () => {
      // In development, debug level should be allowed
      logger.debug('debug message');
      expect(mockConsoleProvider.log).toHaveBeenCalled();
    });

    it('should include all log entry metadata', () => {
      logger.info('test message');

      const logCall = mockConsoleProvider.log.mock.calls[0][0];
      expect(logCall).toMatchObject({
        level: 'info',
        msg: 'test message',
        appVersion: '1.0.0',
        platform: 'mobile',
        pid: 1,
        hostname: 'mobile-app',
      });
      expect(typeof logCall.time).toBe('number');
      expect(typeof logCall.environment).toBe('string');
    });
  });

  describe('flush functionality', () => {
    it('should call flush on providers that support it', async () => {
      const betterStackProvider = new BetterStackProvider({ sourceToken: 'test' });
      logger.addProvider(betterStackProvider);

      await logger.flushLogs();

      expect(mockBetterStackProvider.flush).toHaveBeenCalled();
    });

    it('should handle providers without flush method gracefully', async () => {
      const consoleProvider = new ConsoleProvider();
      logger.addProvider(consoleProvider);

      // Should not throw
      await expect(logger.flushLogs()).resolves.toBeUndefined();
    });
  });

  describe('cleanup functionality', () => {
    it('should call cleanup on providers that support it', async () => {
      const betterStackProvider = new BetterStackProvider({ sourceToken: 'test' });
      logger.addProvider(betterStackProvider);

      await logger.cleanup();

      expect(mockBetterStackProvider.cleanup).toHaveBeenCalled();
    });

    it('should handle providers without cleanup method gracefully', async () => {
      const consoleProvider = new ConsoleProvider();
      logger.addProvider(consoleProvider);

      // Should not throw
      await expect(logger.cleanup()).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', () => {
      const faultyProvider = {
        name: 'faulty',
        log: vi.fn(() => {
          throw new Error('Provider error');
        }),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.addProvider(faultyProvider as any);

      // Should not throw
      expect(() => {
        logger.info('test message');
      }).not.toThrow();
    });

    it('should continue logging to other providers when one fails', () => {
      const faultyProvider = {
        name: 'faulty',
        log: vi.fn(() => {
          throw new Error('Provider error');
        }),
      };

      const workingProvider = {
        name: 'working',
        log: vi.fn(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.addProvider(faultyProvider as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger.addProvider(workingProvider as any);

      logger.info('test message');

      expect(faultyProvider.log).toHaveBeenCalled();
      expect(workingProvider.log).toHaveBeenCalled();
    });
  });
});
