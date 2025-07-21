import { Platform } from 'react-native';
import { LogLevel, LogEntry, LoggerConfig, LoggerOptions, LoggingProvider } from './types';

export class Logger {
    private static instance: Logger;
    private config: LoggerConfig;
    private providers: LoggingProvider[] = [];
    private sessionId: string;
    private isInitialized = false;

    private constructor(config: LoggerConfig) {
        this.config = config;
        this.sessionId = this.generateSessionId();
    }

    public static getInstance(config?: LoggerConfig): Logger {
        if (!Logger.instance && config) {
            Logger.instance = new Logger(config);
        } else if (!Logger.instance) {
            throw new Error('Logger must be initialized with config first');
        }
        return Logger.instance;
    }

    public static async initialize(config: LoggerConfig): Promise<Logger> {
        const logger = Logger.getInstance(config);
        await logger.init();
        return logger;
    }

    private async init(): Promise<void> {
        if (this.isInitialized) return;

        // Initialize providers
        for (const provider of this.config.providers) {
            try {
                await provider.initialize();
                this.providers.push(provider);
                this.debug(`Initialized logging provider: ${provider.name}`);
            } catch (error) {
                console.error(`Failed to initialize provider ${provider.name}:`, error);
            }
        }

        this.isInitialized = true;
        this.info('Logger initialized', {
            providers: this.providers.map(p => p.name),
            environment: this.config.environment,
            sessionId: this.sessionId,
        });
    }

    public updateConfig(updates: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...updates };
    }

    public setUserId(userId: string): void {
        this.config.userId = userId;
    }

    public setContext(context: Record<string, any>): void {
        this.config.context = { ...this.config.context, ...context };
    }

    public debug(message: string, options?: LoggerOptions): void;
    public debug(message: string, ...args: any[]): void;
    public debug(message: string, optionsOrFirstArg?: LoggerOptions | any, ...restArgs: any[]): void {
        const { options, args } = this.parseArguments(optionsOrFirstArg, restArgs);
        this.log('debug', message, options, ...args);
    }

    public info(message: string, options?: LoggerOptions): void;
    public info(message: string, ...args: any[]): void;
    public info(message: string, optionsOrFirstArg?: LoggerOptions | any, ...restArgs: any[]): void {
        const { options, args } = this.parseArguments(optionsOrFirstArg, restArgs);
        this.log('info', message, options, ...args);
    }

    public warn(message: string, options?: LoggerOptions): void;
    public warn(message: string, ...args: any[]): void;
    public warn(message: string, optionsOrFirstArg?: LoggerOptions | any, ...restArgs: any[]): void {
        const { options, args } = this.parseArguments(optionsOrFirstArg, restArgs);
        this.log('warn', message, options, ...args);
    }

    public error(message: string, options?: LoggerOptions): void;
    public error(message: string, error: Error, options?: LoggerOptions): void;
    public error(message: string, ...args: any[]): void;
    public error(
        message: string,
        errorOrOptionsOrFirstArg?: Error | LoggerOptions | any,
        optionsOrSecondArg?: LoggerOptions | any,
        ...restArgs: any[]
    ): void {
        let error: Error | undefined;
        let options: LoggerOptions = {};
        let args: any[] = [];

        // Parse error overload
        if (errorOrOptionsOrFirstArg instanceof Error) {
            error = errorOrOptionsOrFirstArg;
            if (this.isLoggerOptions(optionsOrSecondArg)) {
                options = optionsOrSecondArg;
                args = restArgs;
            } else {
                args = optionsOrSecondArg ? [optionsOrSecondArg, ...restArgs] : restArgs;
            }
        } else {
            const parsed = this.parseArguments(errorOrOptionsOrFirstArg, optionsOrSecondArg ? [optionsOrSecondArg, ...restArgs] : restArgs);
            options = parsed.options;
            args = parsed.args;
        }

        this.log('error', message, { ...options, error }, ...args);
    }

    public group(label: string, options?: LoggerOptions): void {
        if (!this.shouldLog('info')) return;

        this.info(`GROUP START: ${label}`, options);
        if (this.config.enableConsoleLog !== false) {
            console.group(`[PetTracker] ${label}`);
        }
    }

    public groupEnd(): void {
        if (!this.shouldLog('info')) return;

        this.info('GROUP END');
        if (this.config.enableConsoleLog !== false) {
            console.groupEnd();
        }
    }

    public async flush(): Promise<void> {
        const flushPromises = this.providers.map(async (provider) => {
            try {
                await Promise.resolve(provider.flush());
            } catch (error: any) {
                console.error(`Failed to flush provider ${provider.name}:`, error);
            }
        });
        await Promise.all(flushPromises);
    }

    public async destroy(): Promise<void> {
        await this.flush();

        const destroyPromises = this.providers.map(async (provider) => {
            try {
                await Promise.resolve(provider.destroy());
            } catch (error: any) {
                console.error(`Failed to destroy provider ${provider.name}:`, error);
            }
        });
        await Promise.all(destroyPromises);

        this.providers = [];
        this.isInitialized = false;
    }

    private log(level: LogLevel, message: string, options: LoggerOptions = {}, ...args: any[]): void {
        if (!this.shouldLog(level)) return;

        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            message,
            args: args.length > 0 ? args : undefined,
            context: this.mergeContext(options.context),
            error: options.error,
            userId: options.userId || this.config.userId,
            sessionId: options.sessionId || this.sessionId,
            deviceInfo: {
                platform: Platform.OS,
                version: Platform.Version?.toString(),
            },
        };

        // Send to all providers
        for (const provider of this.providers) {
            try {
                provider.log(entry);
            } catch (error) {
                console.error(`Provider ${provider.name} failed to log:`, error);
            }
        }
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enableLogging) return false;
        if (level === 'debug' && !this.config.enableDebugMode) return false;

        // Check minimum log level
        if (this.config.logLevel) {
            const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
            const currentIndex = levels.indexOf(level);
            const minIndex = levels.indexOf(this.config.logLevel);
            return currentIndex >= minIndex;
        }

        return true;
    }

    private parseArguments(optionsOrFirstArg?: LoggerOptions | any, restArgs: any[] = []): { options: LoggerOptions; args: any[] } {
        if (this.isLoggerOptions(optionsOrFirstArg)) {
            return { options: optionsOrFirstArg, args: restArgs };
        } else {
            return {
                options: {},
                args: optionsOrFirstArg !== undefined ? [optionsOrFirstArg, ...restArgs] : restArgs
            };
        }
    }

    private isLoggerOptions(obj: any): obj is LoggerOptions {
        return obj && typeof obj === 'object' && !Array.isArray(obj) &&
            (obj.context !== undefined || obj.userId !== undefined ||
                obj.sessionId !== undefined || obj.error !== undefined);
    }

    private mergeContext(additionalContext?: Record<string, any>): Record<string, any> | undefined {
        const baseContext = this.config.context;
        if (!baseContext && !additionalContext) return undefined;
        return { ...baseContext, ...additionalContext };
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
