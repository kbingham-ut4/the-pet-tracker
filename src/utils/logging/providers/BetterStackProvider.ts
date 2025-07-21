import { LoggingProvider, LogEntry, LogLevel } from '../types';

interface BetterStackConfig {
    sourceToken: string;
    endpoint?: string;
    batchSize?: number;
    flushInterval?: number;
    retryAttempts?: number;
    timeout?: number;
}

interface BetterStackLogEntry {
    timestamp: string;
    level: string;
    message: string;
    context?: Record<string, any>;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
    metadata?: {
        userId?: string;
        sessionId?: string;
        deviceInfo?: Record<string, any>;
        args?: any[];
    };
}

export class BetterStackProvider implements LoggingProvider {
    name = 'betterstack';

    private config: Required<BetterStackConfig>;
    private logQueue: BetterStackLogEntry[] = [];
    private flushTimer?: NodeJS.Timeout;
    private isInitialized = false;

    constructor(config: BetterStackConfig) {
        this.config = {
            endpoint: 'https://in.logs.betterstack.com',
            batchSize: 50,
            flushInterval: 5000, // 5 seconds
            retryAttempts: 3,
            timeout: 10000, // 10 seconds
            ...config,
        };
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        // Validate required config
        if (!this.config.sourceToken) {
            throw new Error('BetterStack source token is required');
        }

        // Start flush timer
        this.startFlushTimer();
        this.isInitialized = true;
    }

    log(entry: LogEntry): void {
        if (!this.isInitialized) {
            console.warn('[BetterStackProvider] Provider not initialized, skipping log');
            return;
        }

        const betterStackEntry: BetterStackLogEntry = {
            timestamp: entry.timestamp.toISOString(),
            level: this.mapLogLevel(entry.level),
            message: entry.message,
            context: entry.context,
            error: entry.error ? {
                name: entry.error.name,
                message: entry.error.message,
                stack: entry.error.stack,
            } : undefined,
            metadata: {
                userId: entry.userId,
                sessionId: entry.sessionId,
                deviceInfo: entry.deviceInfo,
                args: entry.args,
            },
        };

        this.logQueue.push(betterStackEntry);

        // Flush if batch size reached
        if (this.logQueue.length >= this.config.batchSize) {
            this.flush();
        }
    }

    async flush(): Promise<void> {
        if (this.logQueue.length === 0) return;

        const logsToSend = [...this.logQueue];
        this.logQueue = [];

        try {
            await this.sendLogs(logsToSend);
        } catch (error) {
            console.error('[BetterStackProvider] Failed to send logs:', error);

            // Re-add logs to queue for retry (with limit to prevent infinite growth)
            if (this.logQueue.length < 1000) {
                this.logQueue.unshift(...logsToSend);
            }
        }
    }

    async destroy(): Promise<void> {
        // Clear flush timer
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        // Flush remaining logs
        await this.flush();
        this.isInitialized = false;
    }

    private startFlushTimer(): void {
        this.flushTimer = setInterval(() => {
            this.flush().catch(error => {
                console.error('[BetterStackProvider] Flush timer error:', error);
            });
        }, this.config.flushInterval);
    }

    private async sendLogs(logs: BetterStackLogEntry[]): Promise<void> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.sourceToken}`,
                },
                body: JSON.stringify({ logs }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    private mapLogLevel(level: LogLevel): string {
        // BetterStack uses standard syslog levels
        switch (level) {
            case 'debug':
                return 'debug';
            case 'info':
                return 'info';
            case 'warn':
                return 'warn';
            case 'error':
                return 'error';
            default:
                return 'info';
        }
    }
}
