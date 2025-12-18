import { query } from '@/lib/db';

export enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export async function log(level: LogLevel, message: string, meta?: any) {
    try {
        // Fire and forget, don't await to block response
        query(
            'INSERT INTO logs (level, message, meta) VALUES ($1, $2, $3)',
            [level, message, JSON.stringify(meta || {})]
        ).catch(err => console.error('Logging failed:', err));

        // Also log to console
        console.log(`[${level.toUpperCase()}] ${message}`, meta);
    } catch (e) {
        console.error('Logger setup error', e);
    }
}

export const logger = {
    info: (msg: string, meta?: any) => log(LogLevel.INFO, msg, meta),
    warn: (msg: string, meta?: any) => log(LogLevel.WARN, msg, meta),
    error: (msg: string, meta?: any) => log(LogLevel.ERROR, msg, meta),
};
