import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock expo-status-bar
vi.mock('expo-status-bar', () => ({
    StatusBar: () => null,
}));

// Mock react-native-gesture-handler
vi.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock navigation
vi.mock('./src/navigation/RootNavigator', () => ({
    default: () => null,
}));

// Mock contexts
vi.mock('./src/contexts/PetContext', () => ({
    PetProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock logging
const mockInitializeLogger = vi.fn().mockResolvedValue(undefined);
const mockInfo = vi.fn();
vi.mock('./src/utils/logging', () => ({
    initializeLogger: mockInitializeLogger,
    info: mockInfo,
}));

// Mock storage
const mockStorageFactory = {
    getStorageManager: vi.fn().mockReturnValue({
        initialize: vi.fn().mockResolvedValue(undefined),
    }),
};
vi.mock('./src/storage', () => ({
    StorageFactory: mockStorageFactory,
}));

// Mock React Native components for testing
vi.mock('react-native', async () => {
    const actual = await vi.importActual('react-native');
    return {
        ...actual,
        StyleSheet: {
            create: (styles: any) => styles,
        },
    };
});

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (globalThis as any).__DEV__ = true;
    });

    it('renders without crashing', () => {
        const { toJSON } = render(<App />);
        expect(toJSON()).toBeDefined();
    });

    it('shows loading state initially', () => {
        const { getByText } = render(<App />);
        expect(getByText('Initializing Pet Tracker...')).toBeTruthy();
    });

    it('initializes logger on startup', async () => {
        render(<App />);

        await waitFor(() => {
            expect(mockInitializeLogger).toHaveBeenCalledWith({
                enableConsole: true,
                enableBetterStack: false, // __DEV__ is true
                betterStackToken: undefined, // process.env.EXPO_PUBLIC_BETTERSTACK_TOKEN
                logLevel: 'debug', // __DEV__ is true
                context: {
                    appVersion: '1.0.0',
                    platform: 'mobile',
                    environment: 'development',
                },
            });
        });
    });

    it('initializes storage on startup', async () => {
        render(<App />);

        await waitFor(() => {
            expect(mockStorageFactory.getStorageManager).toHaveBeenCalled();
        });
    });

    it('logs app startup', async () => {
        render(<App />);

        await waitFor(() => {
            expect(mockInfo).toHaveBeenCalledWith('Pet Tracker app started');
        });
    });

    it('handles logger initialization error', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockInitializeLogger.mockRejectedValueOnce(new Error('Logger init failed'));

        render(<App />);

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith('Failed to initialize logger:', expect.any(Error));
        });

        consoleError.mockRestore();
    });

    it('handles storage initialization error', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
        const mockStorageManager = {
            initialize: vi.fn().mockRejectedValue(new Error('Storage init failed')),
        };
        mockStorageFactory.getStorageManager.mockReturnValue(mockStorageManager);

        render(<App />);

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith('Failed to initialize storage:', expect.any(Error));
        });

        consoleError.mockRestore();
    });

    it('uses production settings when not in development', async () => {
        (globalThis as any).__DEV__ = false;
        process.env.EXPO_PUBLIC_ENV = 'production';
        process.env.EXPO_PUBLIC_BETTERSTACK_TOKEN = 'test-token';

        render(<App />);

        await waitFor(() => {
            expect(mockInitializeLogger).toHaveBeenCalledWith({
                enableConsole: true,
                enableBetterStack: true, // __DEV__ is false
                betterStackToken: 'test-token',
                logLevel: 'info', // __DEV__ is false
                context: {
                    appVersion: '1.0.0',
                    platform: 'mobile',
                    environment: 'production',
                },
            });
        });

        // Clean up
        delete process.env.EXPO_PUBLIC_ENV;
        delete process.env.EXPO_PUBLIC_BETTERSTACK_TOKEN;
    });

    it('renders main app after initialization', async () => {
        const { queryByText } = render(<App />);

        // Initially shows loading
        expect(queryByText('Initializing Pet Tracker...')).toBeTruthy();

        // After initialization, loading should be gone
        await waitFor(() => {
            expect(queryByText('Initializing Pet Tracker...')).toBeNull();
        });
    });
});
