import { LoggingProvider, LogEntry } from '../types';

interface FileProviderConfig {
    maxFileSize?: number; // in bytes
    maxFiles?: number;
    logDirectory?: string;
    filename?: string;
}

export class FileProvider implements LoggingProvider {
    name = 'file';

    private config: Required<FileProviderConfig>;
    private logBuffer: string[] = [];
    private flushTimer?: NodeJS.Timeout;

    constructor(config: FileProviderConfig = {}) {
        this.config = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            logDirectory: './logs',
            filename: 'pet-tracker.log',
            ...config,
        };
    }

    initialize(): void {
        // Start periodic flush
        this.flushTimer = setInterval(() => {
            this.flush();
        }, 5000);
    }

    log(entry: LogEntry): void {
        const { timestamp, level, message, args = [], context, error, userId, sessionId } = entry;

        const logLine = JSON.stringify({
            timestamp: timestamp.toISOString(),
            level: level.toUpperCase(),
            message,
            args: args.length > 0 ? args : undefined,
            context,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
            } : undefined,
            userId,
            sessionId,
        });

        this.logBuffer.push(logLine);

        // Flush if buffer gets too large
        if (this.logBuffer.length >= 100) {
            this.flush();
        }
    }

    flush(): void {
        if (this.logBuffer.length === 0) return;

        try {
            // In a real React Native app, you'd use react-native-fs or similar
            // For now, we'll just use console as fallback
            console.log('[FileProvider] Would write logs:', this.logBuffer.join('\n'));
            this.logBuffer = [];
        } catch (error) {
            console.error('[FileProvider] Failed to write logs:', error);
        }
    }

    destroy(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush();
    }
}
