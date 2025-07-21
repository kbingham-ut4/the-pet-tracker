export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    args?: any[];
    context?: Record<string, any>;
    error?: Error;
    userId?: string;
    sessionId?: string;
    deviceInfo?: {
        platform: string;
        version?: string;
        model?: string;
    };
}

export interface LoggingProvider {
    name: string;
    initialize(config?: any): Promise<void> | void;
    log(entry: LogEntry): Promise<void> | void;
    flush(): Promise<void> | void;
    destroy(): Promise<void> | void;
}

export interface LoggerConfig {
    enableLogging: boolean;
    enableDebugMode: boolean;
    environment: string;
    providers: LoggingProvider[];
    context?: Record<string, any>;
    sessionId?: string;
    userId?: string;
    enableConsoleLog?: boolean;
    enableRemoteLogging?: boolean;
    logLevel?: LogLevel;
    batchSize?: number;
    flushInterval?: number;
}

export interface LoggerOptions {
    context?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    error?: Error;
}
