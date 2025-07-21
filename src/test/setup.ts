import { vi, expect } from 'vitest';

// Extend expect with custom React Native matchers
expect.extend({
    toHaveTextContent(received: any, expected: any) {
        const pass = received?.props?.children === expected ||
            received?.children === expected ||
            (typeof received?.props?.children === 'string' && received.props.children.includes(expected));

        return {
            message: () => `expected element to have text content "${expected}"`,
            pass,
        };
    },
});

// Mock expo modules
vi.mock('expo-status-bar', () => ({
    StatusBar: 'StatusBar',
}));

vi.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
    MaterialIcons: 'MaterialIcons',
    FontAwesome: 'FontAwesome',
}));

vi.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
    default: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn(),
        getAllKeys: vi.fn(),
        multiGet: vi.fn(),
        multiSet: vi.fn(),
        multiRemove: vi.fn(),
        clear: vi.fn(),
    },
}));

vi.mock('@react-native-community/netinfo', () => ({
    default: {
        fetch: vi.fn(() => Promise.resolve({
            isConnected: true,
            type: 'wifi',
            details: {},
        })),
        addEventListener: vi.fn(() => vi.fn()),
        removeEventListener: vi.fn(),
    },
}));

vi.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: vi.fn(),
        goBack: vi.fn(),
        dispatch: vi.fn(),
    }),
    useRoute: () => ({
        params: {},
    }),
    NavigationContainer: ({ children }: any) => children,
    useFocusEffect: vi.fn(),
}));

vi.mock('@react-navigation/bottom-tabs', () => ({
    createBottomTabNavigator: () => ({
        Navigator: 'Navigator',
        Screen: 'Screen',
    }),
}));

vi.mock('@react-navigation/stack', () => ({
    createStackNavigator: () => ({
        Navigator: 'Navigator',
        Screen: 'Screen',
    }),
}));

// Mock React
vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react')>();
    return {
        ...actual,
        createContext: actual.createContext,
        useContext: actual.useContext,
        useState: actual.useState,
        useEffect: actual.useEffect,
        useMemo: actual.useMemo,
        useCallback: actual.useCallback,
    };
});

// Mock React Native modules
vi.mock('react-native', () => ({
    Platform: {
        OS: 'ios',
        select: vi.fn((options) => options.ios),
    },
    Alert: {
        alert: vi.fn(),
    },
    Dimensions: {
        get: vi.fn(() => ({ width: 375, height: 812 })),
    },
    StyleSheet: {
        create: (styles: any) => styles,
    },
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
    Image: 'Image',
    FlatList: 'FlatList',
    ActivityIndicator: 'ActivityIndicator',
    NativeModules: {},
    PermissionsAndroid: {
        request: vi.fn(),
        check: vi.fn(),
    },
}));

// Global test utilities
global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
};

// Mock React Native globals
(global as any).__DEV__ = true;

// Add global fetch mock if needed
global.fetch = vi.fn();
