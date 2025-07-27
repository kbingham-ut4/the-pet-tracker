# Pet Tracker Logging System

## Overview

The Pet Tracker app uses a modular, provider-based logging system inspired by Pino. This architecture provides structured, contextual logging with support for multiple output destinations and easy extensibility.

**📚 For detailed documentation, see [`src/logger/README.md`](../../src/logger/README.md)**

## Quick Start

### Basic Usage

```typescript
import { info, warn, error, debug } from '@/logger';

// Simple message
info('User logged in');

// With context
info('Pet profile updated', {
  petId: 'pet-123',
  updatedFields: ['name', 'weight'],
});

// Error logging
error('Failed to save pet data', {
  petId: 'pet-123',
  error: error.message,
});
```

### Legacy Imports (Still Supported)

```typescript
// Old imports still work via re-export
import { info, warn, error, debug } from '../utils/logger';
```

## New Architecture Features

The logging system now supports:

- **Multiple Providers**: Console, BetterStack, and custom providers
- **Child Loggers**: Component-specific logging with bound context
- **Batching & Retry**: Efficient remote logging with retry logic
- **Environment Configuration**: Automatic provider setup based on environment
- **Full Backward Compatibility**: Existing imports continue to work

### Child Loggers

```typescript
import { logger } from '@/logger';

// Create a component-specific logger
const petLogger = logger.child({ component: 'PetManagement' });

petLogger.info('Pet created', { petId: '123', name: 'Buddy' });
// Output includes both component context and log-specific context
```

### Custom Configuration

```typescript
import { Logger, ConsoleProvider, BetterStackProvider } from '@/logger';

const customLogger = new Logger();
customLogger.addProvider(new ConsoleProvider());
customLogger.addProvider(
  new BetterStackProvider({
    sourceToken: 'your-token',
  })
);
```

## Migration Guide

### No Action Required

Existing code continues to work without changes:

```typescript
// This still works
import { info, error } from '../utils/logger';
info('Still working!');
```

### Recommended Updates

For new code, prefer the new import path:

```typescript
// Recommended for new code
import { info, error } from '@/logger';
// or
import { logger } from '@/logger';
```

## Documentation

For complete documentation including:

- Provider development
- Configuration options
- Best practices
- Troubleshooting

See the comprehensive guide at [`src/logger/README.md`](../../src/logger/README.md)

// Simple message
info('User logged in');

// With context
info('Pet profile updated', {
context: {
petId: 'pet-123',
updatedFields: ['name', 'weight'],
},
});

// Error logging
error('Failed to save pet data', {
context: {
petId: 'pet-123',
error: error.message,
},
});

````

### Structured Context

The logger automatically includes:

- Timestamp (ISO 8601 format)
- Log level
- App name and version
- Platform (mobile/web)
- Environment (development/staging/production)

Additional context can be provided via the `context` parameter:

```typescript
info('Database operation completed', {
  context: {
    operation: 'create',
    table: 'pets',
    recordId: 'pet-123',
    duration: 150,
  },
});
````

## Common Patterns

### Service Integration

```typescript
import { info, error, debug } from '../utils/logger';

class PetService {
  async createPet(petData: any) {
    info('Creating pet', { context: petData });

    try {
      const result = await this.apiCall(petData);
      info('Pet created successfully', {
        context: { petId: result.id },
      });
      return result;
    } catch (err) {
      error('Pet creation failed', {
        context: {
          error: err.message,
          petData,
        },
      });
      throw err;
    }
  }
}
```

### React Component Integration

```typescript
import { info, debug } from '../utils/logger';

export const PetProfile = ({ petId }: { petId: string }) => {
  useEffect(() => {
    debug('PetProfile component mounted', {
      context: { petId }
    });

    return () => {
      debug('PetProfile component unmounted', {
        context: { petId }
      });
    };
  }, [petId]);

  const handleSave = async (data: any) => {
    info('Saving pet profile', {
      context: { petId, fields: Object.keys(data) }
    });
    // ... save logic
  };

  return <div>...</div>;
};
```

### Context Hook Integration

```typescript
import { info, warn } from '../utils/logger';

export const usePetContext = () => {
  const addPet = useCallback((petData: Pet) => {
    info('Adding pet to context', {
      context: {
        petId: petData.id,
        petName: petData.name,
      },
    });
    // ... context logic
  }, []);

  const updatePet = useCallback((petId: string, updates: Partial<Pet>) => {
    info('Updating pet in context', {
      context: {
        petId,
        updatedFields: Object.keys(updates),
      },
    });
    // ... update logic
  }, []);

  return { addPet, updatePet };
};
```

## Output Format

### Console Output

```
[2025-07-27T17:54:52.607Z] [INFO ] [PetTracker] User logged in {"appVersion":"1.0.0","platform":"mobile","environment":"development","context":{"userId":"user-123"}}
```

### Structured JSON

All logs are formatted as structured JSON with the following schema:

```typescript
{
  timestamp: string;     // ISO 8601 timestamp
  level: LogLevel;       // 'debug' | 'info' | 'warn' | 'error'
  appName: string;       // 'PetTracker'
  appVersion: string;    // From package.json
  platform: string;     // 'mobile' | 'web'
  environment: string;   // 'development' | 'staging' | 'production'
  message: string;       // Log message
  context?: any;         // Additional context data
}
```

## Best Practices

### 1. Use Appropriate Log Levels

- **debug**: Development debugging, verbose information
- **info**: General application flow, important events
- **warn**: Potentially harmful situations, deprecated usage
- **error**: Error events that might still allow the application to continue

### 2. Provide Meaningful Context

```typescript
// Good
info('Pet weight updated', {
  context: {
    petId: 'pet-123',
    oldWeight: 25.5,
    newWeight: 26.2,
    unit: 'kg',
  },
});

// Less helpful
info('Weight updated');
```

### 3. Don't Log Sensitive Information

```typescript
// Bad - exposes sensitive data
info('User authenticated', {
  context: {
    password: 'secret123',
    apiKey: 'abc123',
  },
});

// Good - logs relevant context without sensitive data
info('User authenticated', {
  context: {
    userId: 'user-123',
    loginMethod: 'password',
  },
});
```

### 4. Use Consistent Naming Conventions

- Use camelCase for context property names
- Use descriptive, specific messages
- Include relevant IDs (petId, userId, etc.) in context

### 5. Log State Changes

```typescript
// Service operations
info('Starting data sync', { context: { operation: 'sync', itemCount: 10 } });
info('Data sync completed', { context: { operation: 'sync', synced: 8, failed: 2 } });

// User actions
info('User navigation', { context: { from: 'HomeScreen', to: 'PetProfile' } });
```

## Environment Considerations

### Development

- All log levels are shown
- Logs appear in console and Metro bundler
- Full context information is displayed

### Production

- Only `info`, `warn`, and `error` levels should be used
- `debug` logs are automatically filtered out
- Consider implementing remote logging for production monitoring

## Migration from Old Logger

If migrating from the previous complex logging system:

1. Replace imports:

   ```typescript
   // Old
   import { getLogger } from '../utils/logging';

   // New
   import { info, warn, error, debug } from '../utils/logger';
   ```

2. Replace logger instances:

   ```typescript
   // Old
   private logger = getLogger();
   this.logger.info('message', { context });

   // New
   info('message', { context });
   ```

3. Update error handling:

   ```typescript
   // Old
   this.logger.error('Error occurred', { error: err, context });

   // New
   error('Error occurred', { context: { error: err.message, ...otherContext } });
   ```

   // Good: Redact sensitive information
   logger.info('User login', {
   context: {
   userId: user.id,
   email: user.email.replace(/(.{2})._(@._)/, '$1\*\*\*$2'),
   // password is omitted
   },
   });

// Avoid: Logging sensitive data
logger.info('User login', { context: user }); // Contains password!

````

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
````

### 5. Performance Considerations

```typescript
// Good: Lazy evaluation for expensive operations
logger.debug('Complex data structure', () => ({
  context: { data: JSON.stringify(largeObject) },
}));

// Avoid: Always serializing expensive data
logger.debug('Complex data structure', {
  context: { data: JSON.stringify(largeObject) }, // Always evaluated
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
  context: { debug: true },
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
