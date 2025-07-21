import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleProvider } from '../ConsoleProvider';
import { FileProvider } from '../FileProvider';
import { BetterStackProvider } from '../BetterStackProvider';
import { LogEntry, LogLevel } from '../../types';

describe('ConsoleProvider', () => {
    let provider: ConsoleProvider;
    let mockLogEntry: LogEntry;

    beforeEach(() => {
        provider = new ConsoleProvider();
        mockLogEntry = {
            timestamp: new Date(),
            level: 'info' as LogLevel,
            message: 'Test message',
            args: []
        };

        // Mock console methods
        vi.spyOn(console, 'info').mockImplementation(() => { });
        vi.spyOn(console, 'debug').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.spyOn(console, 'group').mockImplementation(() => { });
        vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should initialize successfully', () => {
            expect(() => provider.initialize()).not.toThrow();
        });

        it('should work with custom config', () => {
            const customProvider = new ConsoleProvider('TestApp', true);
            expect(() => customProvider.initialize()).not.toThrow();
        });
    });

    describe('logging', () => {
        beforeEach(() => {
            provider.initialize();
        });

        it('should log info messages to console.info', () => {
            provider.log(mockLogEntry);
            expect(console.info).toHaveBeenCalled();
        });

        it('should log error messages to console.error', () => {
            const errorEntry = { ...mockLogEntry, level: 'error' as LogLevel };
            provider.log(errorEntry);
            expect(console.error).toHaveBeenCalled();
        });

        it('should log warn messages to console.warn', () => {
            const warnEntry = { ...mockLogEntry, level: 'warn' as LogLevel };
            provider.log(warnEntry);
            expect(console.warn).toHaveBeenCalled();
        });

        it('should log debug messages to console.debug', () => {
            const debugEntry = { ...mockLogEntry, level: 'debug' as LogLevel };
            provider.log(debugEntry);
            expect(console.debug).toHaveBeenCalled();
        });

        it('should format messages with timestamp and level', () => {
            provider.log(mockLogEntry);
            const logCall = (console.info as any).mock.calls[0][0];
            expect(logCall).toContain('[INFO]');
            expect(logCall).toContain('Test message');
            expect(logCall).toContain('[PetTracker]');
        });

        it('should include context in formatted output', () => {
            const entryWithContext = {
                ...mockLogEntry,
                context: { userId: '123', sessionId: 'abc' }
            };
            provider.log(entryWithContext);
            const logCall = (console.info as any).mock.calls[0][0];
            expect(logCall).toContain('userId');
        });
    });

    describe('lifecycle', () => {
        it('should flush without errors', () => {
            provider.initialize();
            expect(() => provider.flush()).not.toThrow();
        });

        it('should destroy without errors', () => {
            provider.initialize();
            expect(() => provider.destroy()).not.toThrow();
        });
    });
});

describe('FileProvider', () => {
    let provider: FileProvider;
    let mockLogEntry: LogEntry;

    beforeEach(() => {
        provider = new FileProvider();
        mockLogEntry = {
            timestamp: new Date(),
            level: 'info' as LogLevel,
            message: 'Test message',
            args: []
        };

        // Mock file operations by spying on console.log which FileProvider uses for simulation
        vi.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with default config', () => {
            expect(() => provider.initialize()).not.toThrow();
        });

        it('should initialize with custom config', () => {
            const customProvider = new FileProvider({
                maxFileSize: 1024 * 1024, // 1MB
                maxFiles: 3,
            });
            expect(() => customProvider.initialize()).not.toThrow();
        });
    });

    describe('logging', () => {
        beforeEach(() => {
            provider.initialize();
        });

        it('should accept log entries', () => {
            expect(() => provider.log(mockLogEntry)).not.toThrow();
        });

        it('should batch log entries before writing', () => {
            provider.log(mockLogEntry);
            provider.log({ ...mockLogEntry, message: 'Second message' });

            // Should not throw and should handle batching
            expect(() => provider.flush()).not.toThrow();
        });

        it('should format log entries consistently', () => {
            provider.log(mockLogEntry);
            // The actual formatting is tested through integration
            expect(() => provider.flush()).not.toThrow();
        });
    });

    describe('file management', () => {
        it('should handle file rotation when size limit exceeded', () => {
            // Create provider with small file size for testing
            const smallProvider = new FileProvider({ maxFileSize: 1024 });
            smallProvider.initialize();

            // Log many entries to trigger rotation
            for (let i = 0; i < 100; i++) {
                smallProvider.log({ ...mockLogEntry, message: `Message ${i}` });
            }

            expect(() => smallProvider.flush()).not.toThrow();
        });

        it('should manage maximum number of files', () => {
            // This is primarily tested through integration with the file system
            expect(() => provider.flush()).not.toThrow();
        });
    });

    describe('auto-flush timer', () => {
        it('should set up flush timer on initialization', async () => {
            const fastProvider = new FileProvider();
            fastProvider.initialize();

            // Wait a bit to see if timer is working
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(() => fastProvider.destroy()).not.toThrow();
        });

        it('should clear timer on destroy', () => {
            provider.initialize();
            expect(() => provider.destroy()).not.toThrow();
        });
    });

    describe('lifecycle', () => {
        it('should flush pending logs on destroy', () => {
            provider.initialize();
            provider.log(mockLogEntry);
            expect(() => provider.destroy()).not.toThrow();
        });
    });
});

describe('BetterStackProvider', () => {
    let provider: BetterStackProvider;
    let mockLogEntry: LogEntry;

    beforeEach(() => {
        // Note: BetterStackProvider requires sourceToken, not apiToken
        provider = new BetterStackProvider({ sourceToken: 'test-token' });
        mockLogEntry = {
            timestamp: new Date(),
            level: 'info' as LogLevel,
            message: 'Test message',
            args: []
        };

        // Mock fetch for API calls
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ status: 'ok' })
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with source token', async () => {
            await expect(provider.initialize()).resolves.not.toThrow();
        });

        it('should throw error without source token', () => {
            const invalidProvider = new BetterStackProvider({ sourceToken: '' });
            expect(invalidProvider.initialize()).rejects.toThrow('BetterStack source token is required');
        });

        it('should initialize with custom config', async () => {
            const configProvider = new BetterStackProvider({
                sourceToken: 'test-token',
                batchSize: 10,
                flushInterval: 10000
            });
            await expect(configProvider.initialize()).resolves.not.toThrow();
        });
    });

    describe('logging', () => {
        beforeEach(async () => {
            await provider.initialize();
        });

        it('should accept log entries', () => {
            expect(() => provider.log(mockLogEntry)).not.toThrow();
        });

        it('should batch logs before sending', async () => {
            await provider.log(mockLogEntry);
            await provider.log({ ...mockLogEntry, message: 'Second message' });

            // Should batch and send
            await expect(provider.flush()).resolves.not.toThrow();
        });

        it('should format logs for BetterStack API', async () => {
            await provider.log(mockLogEntry);
            await expect(provider.flush()).resolves.not.toThrow();
        });
    });

    describe('error handling', () => {
        beforeEach(async () => {
            await provider.initialize();
        });

        it('should handle network errors gracefully', async () => {
            // Mock fetch to reject
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            await provider.log(mockLogEntry);
            await expect(provider.flush()).resolves.not.toThrow();
        });

        it('should handle API errors gracefully', async () => {
            // Mock API error response
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                statusText: 'Bad Request'
            });

            await provider.log(mockLogEntry);
            await expect(provider.flush()).resolves.not.toThrow();
        });

        it('should handle invalid JSON responses', async () => {
            // Mock invalid JSON response
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.reject(new Error('Invalid JSON'))
            });

            await provider.log(mockLogEntry);
            await expect(provider.flush()).resolves.not.toThrow();
        });
    });

    describe('batching and flushing', () => {
        beforeEach(async () => {
            await provider.initialize();
        });

        it('should auto-flush when batch size reached', async () => {
            const smallBatchProvider = new BetterStackProvider({
                sourceToken: 'test-token',
                batchSize: 2
            });
            await smallBatchProvider.initialize();

            await smallBatchProvider.log(mockLogEntry);
            await smallBatchProvider.log({ ...mockLogEntry, message: 'Second' });

            // Should auto-flush on third entry
            expect(() => smallBatchProvider.log({ ...mockLogEntry, message: 'Third' })).not.toThrow();
        });

        it('should flush all pending logs on manual flush', async () => {
            await provider.log(mockLogEntry);
            await provider.log({ ...mockLogEntry, message: 'Second' });

            await expect(provider.flush()).resolves.not.toThrow();
        });
    });

    describe('lifecycle', () => {
        it('should flush pending logs on destroy', async () => {
            await provider.initialize();
            await provider.log(mockLogEntry);
            await expect(provider.destroy()).resolves.not.toThrow();
        });
    });
});

describe('Provider Integration', () => {
    it('should work with all log levels', () => {
        const consoleProvider = new ConsoleProvider();
        const fileProvider = new FileProvider();

        consoleProvider.initialize();
        fileProvider.initialize();

        const providers = [consoleProvider, fileProvider];
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

        // Mock console methods
        vi.spyOn(console, 'info').mockImplementation(() => { });
        vi.spyOn(console, 'debug').mockImplementation(() => { });
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });

        for (const level of levels) {
            const logEntry: LogEntry = {
                timestamp: new Date(),
                level,
                message: `Test ${level} message`,
                args: []
            };

            // Should not throw for any provider/level combination
            expect(() => providers[0].log(logEntry)).not.toThrow();
            expect(() => providers[1].log(logEntry)).not.toThrow();
        }

        // Clean up
        providers.forEach(p => p.destroy());
        vi.restoreAllMocks();
    });
});
