/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleProvider } from '../ConsoleProvider';
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
      args: [],
    };

    // Mock console methods
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
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

    it('should log info message', () => {
      provider.log(mockLogEntry);
      expect(console.info).toHaveBeenCalled();
    });

    it('should log debug message', () => {
      provider.log({ ...mockLogEntry, level: 'debug' as LogLevel });
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log warn message', () => {
      provider.log({ ...mockLogEntry, level: 'warn' as LogLevel });
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error message', () => {
      provider.log({ ...mockLogEntry, level: 'error' as LogLevel });
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle arguments', () => {
      const entryWithArgs = { ...mockLogEntry, args: ['arg1', 'arg2'] };
      provider.log(entryWithArgs);
      expect(console.info).toHaveBeenCalled();
    });

    it('should handle object arguments', () => {
      const entryWithObjects = { ...mockLogEntry, args: [{ key: 'value' }] };
      provider.log(entryWithObjects);
      expect(console.info).toHaveBeenCalled();
    });

    it('should handle string formatting', () => {
      const entryWithFormatting = { ...mockLogEntry, message: 'User %s logged in', args: ['John'] };
      provider.log(entryWithFormatting);
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should destroy gracefully', () => {
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
    // Use small batch size and flush interval for testing
    provider = new BetterStackProvider({
      sourceToken: 'test-token',
      batchSize: 1, // Flush immediately
      flushInterval: 100, // Short interval for testing
    });
    mockLogEntry = {
      timestamp: new Date(),
      level: 'info' as LogLevel,
      message: 'Test message',
      args: [],
    };

    // Mock fetch globally
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as any).fetch;
  });

  describe('initialization', () => {
    it('should initialize successfully', () => {
      expect(() => provider.initialize()).not.toThrow();
    });

    it('should work with custom config', () => {
      const customProvider = new BetterStackProvider({
        sourceToken: 'custom-token',
        endpoint: 'https://custom.betterstack.com',
        batchSize: 50,
        flushInterval: 2000,
      });
      expect(() => customProvider.initialize()).not.toThrow();
    });

    it('should throw on missing token', async () => {
      const provider = new BetterStackProvider({} as any);
      await expect(provider.initialize()).rejects.toThrow();
    });
  });

  describe('logging', () => {
    beforeEach(async () => {
      await provider.initialize();
    });

    it('should log info message', async () => {
      provider.log(mockLogEntry);
      // Wait for batch to flush (immediate with batchSize=1)
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetch).toHaveBeenCalled();
    });

    it('should log debug message', async () => {
      provider.log({ ...mockLogEntry, level: 'debug' as LogLevel });
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetch).toHaveBeenCalled();
    });

    it('should log warn message', async () => {
      provider.log({ ...mockLogEntry, level: 'warn' as LogLevel });
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetch).toHaveBeenCalled();
    });

    it('should log error message', async () => {
      provider.log({ ...mockLogEntry, level: 'error' as LogLevel });
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(fetch).toHaveBeenCalled();
    });

    it('should handle batch operations', async () => {
      // Log multiple entries
      for (let i = 0; i < 5; i++) {
        provider.log({ ...mockLogEntry, message: `Message ${i}` });
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetch).toHaveBeenCalledTimes(5); // Should be called once per message with batchSize=1
    });

    it('should handle network errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
      expect(() => provider.log(mockLogEntry)).not.toThrow();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Bad request' }),
      });
      expect(() => provider.log(mockLogEntry)).not.toThrow();
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });

  describe('batching', () => {
    beforeEach(async () => {
      await provider.initialize();
    });

    it('should respect batch size', async () => {
      const smallBatchProvider = new BetterStackProvider({
        sourceToken: 'test-token',
        batchSize: 2,
      });
      await smallBatchProvider.initialize();

      // Log 3 entries, should trigger batch flush after 2
      smallBatchProvider.log(mockLogEntry);
      smallBatchProvider.log(mockLogEntry);
      smallBatchProvider.log(mockLogEntry);

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetch).toHaveBeenCalled();
    });

    it('should flush on interval', async () => {
      const fastFlushProvider = new BetterStackProvider({
        sourceToken: 'test-token',
        flushInterval: 50,
      });
      await fastFlushProvider.initialize();

      fastFlushProvider.log(mockLogEntry);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should destroy gracefully', async () => {
      await provider.initialize();
      provider.log(mockLogEntry);
      expect(() => provider.destroy()).not.toThrow();
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  });
});

describe('Provider Integration', () => {
  it('should work with all log levels', () => {
    const consoleProvider = new ConsoleProvider();

    consoleProvider.initialize();

    const providers = [consoleProvider];
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

    // Mock console methods
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    for (const level of levels) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level,
        message: `Test ${level} message`,
        args: [],
      };

      providers.forEach(provider => provider.log(logEntry));
    }

    // Verify all levels were called
    expect(console.debug).toHaveBeenCalled();
    expect(console.info).toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();

    // Cleanup
    providers.forEach(provider => provider.destroy());
    vi.restoreAllMocks();
  });
});
