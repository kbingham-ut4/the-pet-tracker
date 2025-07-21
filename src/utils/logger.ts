import { config } from '../config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private static instance: Logger;
    private enableLogging: boolean;
    private enableDebugMode: boolean;

    private constructor() {
        this.enableLogging = config.enableLogging;
        this.enableDebugMode = config.enableDebugMode;
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.enableLogging) return false;
        if (level === 'debug' && !this.enableDebugMode) return false;
        return true;
    }

    private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
        if (!this.shouldLog(level)) return;

        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [PetTracker]`;

        switch (level) {
            case 'debug':
                console.debug(prefix, message, ...args);
                break;
            case 'info':
                console.info(prefix, message, ...args);
                break;
            case 'warn':
                console.warn(prefix, message, ...args);
                break;
            case 'error':
                console.error(prefix, message, ...args);
                break;
        }
    }

    public debug(message: string, ...args: any[]): void {
        this.formatMessage('debug', message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this.formatMessage('info', message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.formatMessage('warn', message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this.formatMessage('error', message, ...args);
    }

    public group(label: string): void {
        if (this.enableLogging) {
            console.group(`[PetTracker] ${label}`);
        }
    }

    public groupEnd(): void {
        if (this.enableLogging) {
            console.groupEnd();
        }
    }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const { debug, info, warn, error, group, groupEnd } = logger;
