/**
 * Pet Tracker Logging System Usage Examples
 * 
 * This file demonstrates how to use the pluggable logging system
 * with BetterStack and other providers throughout the application.
 */

// Import the logging system
import {
    LoggerFactory,
    Logger,
    debug,
    info,
    warn,
    error,
    initializeLogger,
    getLogger
} from './index';

/**
 * Basic Usage Examples
 */

// 1. Using convenience functions (recommended for most cases)
export const basicLoggingExamples = () => {
    // Simple logging
    debug('User navigated to home screen');
    info('Pet profile loaded successfully', { petId: '123' });
    warn('API response took longer than expected', { duration: 5000 });
    error('Failed to save pet data', { error: 'Network timeout' });

    // Logging with context
    info('User action', {
        context: {
            action: 'feed_pet',
            petId: '123',
            userId: 'user_456'
        }
    });

    // Logging errors with stack traces
    try {
        // Some operation that might fail
        throw new Error('Something went wrong');
    } catch (err) {
        error('Operation failed', {
            error: err instanceof Error ? err : new Error('Unknown error'),
            context: { operation: 'pet_feeding' }
        });
    }
};

/**
 * Advanced Usage with Logger Instance
 */
export const advancedLoggingExamples = async () => {
    // Initialize logger with custom configuration
    const logger = await LoggerFactory.createLogger({
        enableConsole: true,
        enableBetterStack: true,
        betterStackToken: process.env.EXPO_PUBLIC_BETTERSTACK_TOKEN,
        logLevel: 'info',
        context: {
            component: 'PetService',
            version: '1.0.0'
        }
    });

    // Set user context
    logger.setUserId('user_123');
    logger.setContext({
        sessionId: 'session_456',
        deviceType: 'mobile'
    });

    // Structured logging
    logger.info('Pet feeding scheduled', {
        context: {
            petId: '123',
            feedingTime: new Date().toISOString(),
            foodType: 'dry_kibble',
            amount: '200g'
        }
    });

    // Performance monitoring
    const startTime = Date.now();
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const duration = Date.now() - startTime;

        logger.info('API call completed', {
            context: {
                endpoint: '/api/pets',
                method: 'GET',
                duration,
                status: 'success'
            }
        });
    } catch (err) {
        logger.error('API call failed', {
            error: err instanceof Error ? err : new Error('Unknown error'),
            context: {
                endpoint: '/api/pets',
                method: 'GET',
                duration: Date.now() - startTime
            }
        });
    }
};

/**
 * Environment-Specific Logger Setup
 */
export const setupEnvironmentLogger = async () => {
    let logger: Logger;

    if (__DEV__) {
        // Development: Console + File logging
        logger = await LoggerFactory.createDevelopmentLogger('dev_user_123');
        logger.debug('Development logger initialized');
    } else {
        // Production: BetterStack logging
        const betterStackToken = process.env.EXPO_PUBLIC_BETTERSTACK_TOKEN;
        if (!betterStackToken) {
            throw new Error('BetterStack token not configured for production');
        }

        logger = await LoggerFactory.createProductionLogger(
            betterStackToken,
            'prod_user_123'
        );
        logger.info('Production logger initialized');
    }

    return logger;
};

/**
 * Service Class with Integrated Logging
 */
export class PetService {
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    async createPet(petData: any) {
        this.logger.info('Creating new pet', {
            context: {
                action: 'create_pet',
                petName: petData.name,
                breed: petData.breed
            }
        });

        try {
            // Simulate API call
            const pet = await this.savePetToAPI(petData);

            this.logger.info('Pet created successfully', {
                context: {
                    petId: pet.id,
                    petName: pet.name,
                    timestamp: new Date().toISOString()
                }
            });

            return pet;
        } catch (error) {
            this.logger.error('Failed to create pet', {
                error: error instanceof Error ? error : new Error('Unknown error'),
                context: {
                    petData: { ...petData, owner: '[REDACTED]' }, // Remove sensitive data
                    timestamp: new Date().toISOString()
                }
            });
            throw error;
        }
    }

    async feedPet(petId: string, foodAmount: number) {
        this.logger.group('Pet Feeding Operation');

        try {
            this.logger.info('Starting pet feeding', {
                context: { petId, foodAmount }
            });

            // Validate input
            if (foodAmount <= 0) {
                this.logger.warn('Invalid food amount provided', {
                    context: { petId, foodAmount }
                });
                throw new Error('Food amount must be positive');
            }

            // Record feeding
            await this.recordFeeding(petId, foodAmount);

            this.logger.info('Pet feeding completed successfully', {
                context: { petId, foodAmount }
            });

        } finally {
            this.logger.groupEnd();
        }
    }

    private async savePetToAPI(petData: any): Promise<any> {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ id: '123', ...petData });
            }, 500);
        });
    }

    private async recordFeeding(petId: string, amount: number): Promise<void> {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(resolve, 300);
        });
    }
}

/**
 * React Component with Logging
 */
export const PetProfileComponent = () => {
    const logger = getLogger(); // Get initialized logger instance

    const handlePetUpdate = async (petId: string, updates: any) => {
        logger.info('User updating pet profile', {
            context: {
                screen: 'PetProfile',
                petId,
                updateFields: Object.keys(updates)
            }
        });

        try {
            // Update pet logic here
            logger.info('Pet profile updated successfully', {
                context: { petId }
            });
        } catch (error) {
            logger.error('Failed to update pet profile', {
                error: error instanceof Error ? error : new Error('Unknown error'),
                context: {
                    screen: 'PetProfile',
                    petId
                }
            });
        }
    };

    // Component render logic would go here
    return null;
};

/**
 * Error Boundary with Logging
 */
export class LoggingErrorBoundary {
    private logger: Logger;

    constructor() {
        this.logger = getLogger();
    }

    componentDidCatch(error: Error, errorInfo: any) {
        this.logger.error('React component error caught', {
            error,
            context: {
                componentStack: errorInfo.componentStack,
                errorBoundary: true,
                timestamp: new Date().toISOString()
            }
        });

        // You could also send this to crash reporting services
    }
}

/**
 * Custom Hook for Component Logging
 */
export const useLogging = (componentName: string) => {
    const logger = getLogger();

    const logAction = (action: string, context?: any) => {
        logger.info(`${componentName}: ${action}`, { context });
    };

    const logError = (action: string, error: Error, context?: any) => {
        logger.error(`${componentName}: ${action} failed`, {
            error,
            context: { ...context, component: componentName }
        });
    };

    return { logAction, logError };
};

/**
 * Initialize Logging System in App Root
 */
export const initializeAppLogging = async () => {
    try {
        // Initialize the default logger based on environment
        await initializeLogger({
            enableConsole: true,
            enableBetterStack: !__DEV__, // Only in production/staging
            betterStackToken: process.env.EXPO_PUBLIC_BETTERSTACK_TOKEN,
            logLevel: __DEV__ ? 'debug' : 'info',
            context: {
                appVersion: '1.0.0',
                platform: 'mobile',
                environment: process.env.EXPO_PUBLIC_ENV || 'development'
            }
        });

        info('Pet Tracker logging system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize logging system:', error);
        // Fallback to console logging only
        console.warn('Falling back to console-only logging');
    }
};
