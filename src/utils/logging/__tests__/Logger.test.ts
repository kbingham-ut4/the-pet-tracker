import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Logger } from '../Logger';
import { LogLevel, LoggerConfig, LoggingProvider } from '../types';

// Mock React Native Platform
vi.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: vi.fn(),
    },
}));

describe('Logger', () => {
    let mockProvider1: LoggingProvider;
    let mockProvider2: LoggingProvider;
    let config: LoggerConfig;

    beforeEach(() => {
        // Clear any existing logger instance
        (Logger as any).instance = undefined;

        mockProvider1 = {
            name: 'console',
            initialize: vi.fn().mockResolvedValue(undefined),
            log: vi.fn().mockResolvedValue(undefined),
            flush: vi.fn().mockResolvedValue(undefined),
            destroy: vi.fn().mockResolvedValue(undefined),
        };

        mockProvider2 = {
            name: 'file',
            initialize: vi.fn().mockResolvedValue(undefined),
            log: vi.fn().mockResolvedValue(undefined),
            flush: vi.fn().mockResolvedValue(undefined),
            destroy: vi.fn().mockResolvedValue(undefined),
        };

        config = {
            enableLogging: true,
            enableDebugMode: true,
            environment: 'test',
            providers: [mockProvider1, mockProvider2],
            enableConsoleLog: true,
            enableRemoteLogging: false,
            logLevel: 'debug' as LogLevel,
            batchSize: 10,
            flushInterval: 5000,
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with config', async () => {
            const logger = await Logger.initialize(config);

            expect(logger).toBeDefined();
            expect(mockProvider1.initialize).toHaveBeenCalled();
            expect(mockProvider2.initialize).toHaveBeenCalled();
        });

        it('should handle provider initialization failures', async () => {
            mockProvider1.initialize = vi.fn().mockRejectedValue(new Error('Init failed'));

            const logger = await Logger.initialize(config);

            expect(logger).toBeDefined();
            expect(mockProvider2.initialize).toHaveBeenCalled();
        });

        it('should throw error when getting instance without initialization', () => {
            expect(() => Logger.getInstance()).toThrow('Logger must be initialized with config first');
        });

        it('should return same instance on subsequent calls', async () => {
            const logger1 = await Logger.initialize(config);
            const logger2 = Logger.getInstance();

            expect(logger1).toBe(logger2);
        });
    });

    describe('logging methods', () => {
        let logger: Logger;

        beforeEach(async () => {
            logger = await Logger.initialize(config);
        });

        it('should log debug messages', () => {
            logger.debug('Debug message', { context: { test: 'data' } });

            expect(mockProvider1.log).toHaveBeenCalledWith(expect.objectContaining({
                level: 'debug',
                message: 'Debug message',
            }));
        });

        it('should log info messages', () => {
            logger.info('Info message');

            expect(mockProvider1.log).toHaveBeenCalledWith(expect.objectContaining({
                level: 'info',
                message: 'Info message',
            }));
        });

        it('should log warn messages', () => {
            logger.warn('Warning message');

            expect(mockProvider1.log).toHaveBeenCalledWith(expect.objectContaining({
                level: 'warn',
                message: 'Warning message',
            }));
        });

        it('should log error messages', () => {
            const error = new Error('Test error');
            logger.error('Error message', error);

            expect(mockProvider1.log).toHaveBeenCalledWith(expect.objectContaining({
                level: 'error',
                message: 'Error message',
                error: error,
            }));
        });

        it('should include session metadata', () => {
            logger.info('Test message');

            expect(mockProvider1.log).toHaveBeenCalledWith(expect.objectContaining({
                sessionId: expect.any(String),
                timestamp: expect.any(Date),
            }));
        });
    });

    describe('configuration', () => {
        let logger: Logger;

        beforeEach(async () => {
            logger = await Logger.initialize(config);
        });

        it('should update config', () => {
            logger.updateConfig({ enableDebugMode: false });

            // Test that the config is updated (we can't directly access it, so test behavior)
            expect(() => logger.updateConfig({ enableDebugMode: false })).not.toThrow();
        });

        it('should set user ID', () => {
            expect(() => logger.setUserId('user123')).not.toThrow();
        });

        it('should set context', () => {
            expect(() => logger.setContext({ module: 'test' })).not.toThrow();
        });
    });

    describe('grouping', () => {
        let logger: Logger;

        beforeEach(async () => {
            logger = await Logger.initialize(config);
        });

        it('should start and end groups', () => {
            logger.group('Test Group');
            logger.groupEnd();

            expect(mockProvider1.log).toHaveBeenCalledWith(expect.objectContaining({
                message: 'GROUP START: Test Group',
            }));
            expect(mockProvider1.log).toHaveBeenCalledWith(expect.objectContaining({
                message: 'GROUP END',
            }));
        });
    });

    describe('error handling', () => {
        let logger: Logger;

        beforeEach(async () => {
            logger = await Logger.initialize(config);
        });

        it('should handle provider logging failures gracefully', () => {
            mockProvider1.log = vi.fn().mockRejectedValue(new Error('Log failed'));

            // Should not throw
            expect(() => logger.info('Test message')).not.toThrow();
        });

        it('should continue with other providers if one fails', () => {
            mockProvider1.log = vi.fn().mockRejectedValue(new Error('Log failed'));

            logger.info('Test message');

            expect(mockProvider2.log).toHaveBeenCalled();
        });
    });

    describe('cleanup', () => {
        let logger: Logger;

        beforeEach(async () => {
            logger = await Logger.initialize(config);
        });

        it('should flush all providers', async () => {
            await logger.flush();

            expect(mockProvider1.flush).toHaveBeenCalled();
            expect(mockProvider2.flush).toHaveBeenCalled();
        });

        it('should destroy all providers', async () => {
            await logger.destroy();

            expect(mockProvider1.destroy).toHaveBeenCalled();
            expect(mockProvider2.destroy).toHaveBeenCalled();
        });
    });
});
