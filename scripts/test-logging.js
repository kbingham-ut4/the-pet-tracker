#!/usr/bin/env node

/**
 * Quick test script for the Pet Tracker logging system
 * Run with: node scripts/test-logging.js
 */

const { LoggerFactory } = require('../src/utils/logging');

async function testLoggingSystem() {
    console.log('🚀 Testing Pet Tracker Logging System...\n');

    try {
        // Test 1: Console Logger (Development)
        console.log('📝 Test 1: Console Logger');
        const consoleLogger = await LoggerFactory.createDevelopmentLogger('test_user_123');

        consoleLogger.debug('Debug message from console logger');
        consoleLogger.info('Info message with context', {
            context: { testId: '1', feature: 'console_logging' }
        });
        consoleLogger.warn('Warning message');
        consoleLogger.error('Error message', {
            error: new Error('Test error'),
            context: { testStep: 'console_test' }
        });

        // Test 2: Group functionality
        console.log('\n📝 Test 2: Grouped Operations');
        consoleLogger.group('Pet Operation Test');
        consoleLogger.info('Step 1: Validating pet data');
        consoleLogger.info('Step 2: Processing pet information');
        consoleLogger.info('Step 3: Saving pet to database');
        consoleLogger.groupEnd();

        // Test 3: Performance logging
        console.log('\n📝 Test 3: Performance Logging');
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate work
        const duration = Date.now() - startTime;

        consoleLogger.info('API operation completed', {
            context: {
                operation: 'test_api_call',
                duration,
                status: 'success'
            }
        });

        // Test 4: Context and session tracking
        console.log('\n📝 Test 4: Context and Session Tracking');
        consoleLogger.setUserId('user_456');
        consoleLogger.setContext({
            appVersion: '1.0.0',
            testMode: true,
            environment: 'test'
        });

        consoleLogger.info('User action logged with context', {
            context: {
                action: 'pet_creation',
                petType: 'dog',
                breed: 'Golden Retriever'
            }
        });

        console.log('\n✅ All logging tests completed successfully!');
        console.log('📊 Next steps:');
        console.log('  1. Set up your BetterStack account');
        console.log('  2. Add EXPO_PUBLIC_BETTERSTACK_TOKEN to your .env files');
        console.log('  3. Test in production mode for remote logging');
        console.log('  4. Check the logs in your BetterStack dashboard');

    } catch (error) {
        console.error('❌ Logging test failed:', error);
    } finally {
        // Clean up
        try {
            await LoggerFactory.destroyLogger();
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    testLoggingSystem();
}

module.exports = { testLoggingSystem };
