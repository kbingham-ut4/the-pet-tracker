# Pet Tracker Logging System

## Overview

The Pet Tracker app uses a comprehensive, pluggable logging system that supports multiple logging providers including console output, file logging, and remote logging via BetterStack. This system is designed to provide structured, contextual logging across different environments with appropriate log levels and filtering.

## Architecture

### Core Components

1. **LoggingProvider Interface**: Defines the contract for all logging providers
2. **Logger Class**: Main logging orchestrator that manages multiple providers
3. **LoggerFactory**: Factory class for creating configured logger instances
4. **Built-in Providers**:
   - `ConsoleProvider`: For development debugging
   - `BetterStackProvider`: For remote logging and monitoring
   - `FileProvider`: For local file-based logging

### Type Safety

The logging system is fully typed with TypeScript, providing:
- `LogLevel`: 'debug' | 'info' | 'warn' | 'error'
- `LogEntry`: Structured log entry with metadata
- `LoggerConfig`: Configuration options for logger initialization
- `LoggerOptions`: Per-log contextual options

## Configuration

### Environment Variables

Add these to your `.env.*` files:

```bash
# BetterStack Configuration
EXPO_PUBLIC_BETTERSTACK_TOKEN=your_betterstack_source_token
EXPO_PUBLIC_BETTERSTACK_ENDPOINT=https://in.logs.betterstack.com
```

### Logger Initialization

#### Automatic Initialization (Recommended)

```typescript
import { initializeAppLogging } from '../utils/logging/examples';

// In your App.tsx or main entry point
export default function App() {
  useEffect(() => {
    initializeAppLogging();
  }, []);
  
  return <YourAppComponents />;
}
```

#### Manual Configuration

```typescript
import { LoggerFactory } from '../utils/logging';

// Development logger
const devLogger = await LoggerFactory.createDevelopmentLogger('user_123');

// Production logger
const prodLogger = await LoggerFactory.createProductionLogger(
  'your_betterstack_token',
  'user_123'
);

// Custom configuration
const customLogger = await LoggerFactory.createLogger({
  enableConsole: true,
  enableBetterStack: true,
  betterStackToken: process.env.EXPO_PUBLIC_BETTERSTACK_TOKEN,
  logLevel: 'info',
  context: { component: 'MyService' }
});
```

## Usage Patterns

### Basic Logging

```typescript
import { debug, info, warn, error } from '../utils/logging';

// Simple logging
debug('User navigated to screen');
info('Operation completed successfully');
warn('Deprecated API used');
error('Operation failed');

// With context
info('Pet created', { 
  context: { 
    petId: '123', 
    petName: 'Fluffy' 
  } 
});
```

### Service Integration

```typescript
import { getLogger } from '../utils/logging';

class PetService {
  private logger = getLogger();

  async createPet(petData: any) {
    this.logger.info('Creating pet', { context: petData });
    
    try {
      const result = await this.apiCall(petData);
      this.logger.info('Pet created successfully', { 
        context: { petId: result.id }
      });
      return result;
    } catch (error) {
      this.logger.error('Pet creation failed', { 
        error, 
        context: petData 
      });
      throw error;
    }
  }
}
```

### React Component Integration

```typescript
import { useLogging } from '../utils/logging/examples';

function PetProfileScreen({ petId }: { petId: string }) {
  const { logAction, logError } = useLogging('PetProfileScreen');

  const handleSave = async (data: any) => {
    logAction('save_pet_profile', { petId });
    
    try {
      await savePetProfile(data);
      logAction('save_pet_profile_success', { petId });
    } catch (error) {
      logError('save_pet_profile', error, { petId });
    }
  };

  return (
    // Your component JSX
  );
}
```

### Grouped Operations

```typescript
import { getLogger } from '../utils/logging';

const logger = getLogger();

async function complexOperation() {
  logger.group('Complex Pet Operation');
  
  try {
    logger.info('Step 1: Validating data');
    // validation logic
    
    logger.info('Step 2: Processing');
    // processing logic
    
    logger.info('Step 3: Saving');
    // save logic
    
  } finally {
    logger.groupEnd();
  }
}
```

## Environment-Specific Behavior

### Development
- **Providers**: Console + File
- **Log Level**: debug
- **Features**: Detailed logging, stack traces, performance metrics

### Testing
- **Providers**: Console (minimal)
- **Log Level**: warn
- **Features**: Only warnings and errors

### Staging
- **Providers**: Console + BetterStack
- **Log Level**: info
- **Features**: Full remote logging for testing

### Production
- **Providers**: BetterStack only
- **Log Level**: info
- **Features**: Remote logging, error aggregation, performance monitoring

## BetterStack Integration

### Setup

1. Sign up at [BetterStack](https://betterstack.com)
2. Create a new source in your BetterStack dashboard
3. Copy the source token to your environment variables
4. Configure the logger to use BetterStack provider

### Features

- **Automatic Batching**: Logs are batched and sent periodically
- **Retry Logic**: Failed log submissions are retried automatically
- **Structured Data**: Full context and metadata preservation
- **Error Tracking**: Stack traces and error details
- **Performance Monitoring**: Request timing and performance metrics

### Log Structure in BetterStack

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "message": "Pet created successfully",
  "context": {
    "petId": "123",
    "petName": "Fluffy"
  },
  "metadata": {
    "userId": "user_456",
    "sessionId": "session_789",
    "deviceInfo": {
      "platform": "ios",
      "version": "17.0"
    }
  }
}
```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// DEBUG: Detailed diagnostic information
debug('Function entered with params', { params });

// INFO: General application flow
info('User logged in', { userId });

// WARN: Something unexpected but not critical
warn('API rate limit approaching', { remaining: 10 });

// ERROR: Something failed and needs attention
error('Payment processing failed', { error, orderId });
```

### 2. Provide Context

```typescript
// Good: Rich context
logger.info('Order processed', {
  context: {
    orderId: '123',
    amount: 49.99,
    userId: 'user_456',
    duration: 1500
  }
});

// Avoid: Minimal context
logger.info('Order processed');
```

### 3. Handle Sensitive Data

```typescript
// Good: Redact sensitive information
logger.info('User login', {
  context: {
    userId: user.id,
    email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
    // password is omitted
  }
});

// Avoid: Logging sensitive data
logger.info('User login', { context: user }); // Contains password!
```

### 4. Use Error Objects Properly

```typescript
// Good: Pass Error objects
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { 
    error: error instanceof Error ? error : new Error('Unknown error'),
    context: { operation: 'risky' }
  });
}

// Avoid: String errors lose stack traces
catch (error) {
  logger.error('Operation failed: ' + error);
}
```

### 5. Performance Considerations

```typescript
// Good: Lazy evaluation for expensive operations
logger.debug('Complex data structure', () => ({
  context: { data: JSON.stringify(largeObject) }
}));

// Avoid: Always serializing expensive data
logger.debug('Complex data structure', { 
  context: { data: JSON.stringify(largeObject) } // Always evaluated
});
```

## Monitoring and Alerting

### BetterStack Dashboard

- View real-time logs
- Set up alerts for error patterns
- Monitor application performance
- Track user behavior flows

### Key Metrics to Monitor

1. **Error Rate**: Percentage of error logs vs total logs
2. **Response Times**: API call durations
3. **User Actions**: Feature usage patterns
4. **Performance**: App startup time, screen load times

### Alerting Rules

```javascript
// Example BetterStack alert rules
{
  "name": "High Error Rate",
  "condition": "error count > 10 in 5 minutes",
  "notification": "email, slack"
}

{
  "name": "API Slowdown",
  "condition": "average duration > 2000ms in 10 minutes",
  "notification": "email"
}
```

## Troubleshooting

### Common Issues

1. **BetterStack Token Not Working**
   - Verify token is correct in environment variables
   - Check network connectivity
   - Ensure token has proper permissions

2. **Logs Not Appearing**
   - Check log level configuration
   - Verify provider initialization
   - Look for initialization errors in console

3. **Performance Issues**
   - Reduce batch size if memory is limited
   - Increase flush interval for better performance
   - Consider disabling debug logs in production

### Debug Mode

Enable detailed logging:

```typescript
const logger = await LoggerFactory.createLogger({
  logLevel: 'debug',
  enableConsole: true,
  context: { debug: true }
});
```

## Migration Guide

If you have existing logging code, here's how to migrate:

### Old Code
```typescript
console.log('User action');
console.error('Something failed', error);
```

### New Code
```typescript
import { info, error } from '../utils/logging';

info('User action', { context: { action: 'specific_action' } });
error('Something failed', { error, context: { operation: 'specific_operation' } });
```

## Contributing

When adding new logging providers:

1. Implement the `LoggingProvider` interface
2. Add proper error handling and retries
3. Include comprehensive tests
4. Update documentation
5. Add configuration options to `LoggerFactory`

See `src/utils/logging/providers/BetterStackProvider.ts` for a complete example.
