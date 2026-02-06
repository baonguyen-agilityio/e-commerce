import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env } from '@config/environment';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
    const isDevelopment = env.NODE_ENV === 'development' || !env.NODE_ENV;
    return isDevelopment ? 'debug' : 'info';
};

// Custom format for masking sensitive data
const maskSensitiveData = winston.format((info) => {
    const sensitiveFields = ['password', 'paymentMethodId', 'cardNumber', 'cvv', 'ssn'];
    const maskValue = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(maskValue);
        }

        const masked: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
                masked[key] = '***REDACTED***';
            } else if (typeof value === 'object') {
                masked[key] = maskValue(value);
            } else {
                masked[key] = value;
            }
        }
        return masked;
    };

    return maskValue(info);
});

// Format for development (colorized, readable)
const devFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.errors({ stack: true }),
    maskSensitiveData(),
    winston.format.printf(
        (info) => {
            const { timestamp, level, message, context, requestId, userId, ...meta } = info;

            let log = `${timestamp} [${level}]`;

            if (requestId) log += ` [ReqID: ${requestId}]`;
            if (userId) log += ` [User: ${userId}]`;
            if (context) log += ` [${context}]`;

            log += `: ${message}`;

            if (Object.keys(meta).length > 0) {
                log += `\n${JSON.stringify(meta, null, 2)}`;
            }

            return log;
        }
    )
);

// Format for production (JSON)
const prodFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    maskSensitiveData(),
    winston.format.json()
);

// Create transports
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
    new winston.transports.Console({
        format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
    })
);

// File transports for production
if (env.NODE_ENV === 'production') {
    // Error logs - rotate daily, keep for 30 days
    transports.push(
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: '30d',
            maxSize: '20m',
            format: prodFormat,
        })
    );

    // Combined logs - rotate daily, keep for 14 days
    transports.push(
        new DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: '14d',
            maxSize: '20m',
            format: prodFormat,
        })
    );
}

// Create the logger
const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
    exitOnError: false,
});

// Export logger with typed methods
export default logger;

// Helper type for log context
export interface LogContext {
    requestId?: string;
    userId?: string;
    context?: string;
    [key: string]: any;
}

// Utility functions for common logging patterns
export const loggers = {
    http: (message: string, meta?: LogContext) => logger.http(message, meta),
    info: (message: string, meta?: LogContext) => logger.info(message, meta),
    warn: (message: string, meta?: LogContext) => logger.warn(message, meta),
    error: (message: string, error?: Error | unknown, meta?: LogContext) => {
        const errorMeta = {
            ...meta,
            ...(error instanceof Error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }),
        };
        logger.error(message, errorMeta);
    },
    debug: (message: string, meta?: LogContext) => logger.debug(message, meta),
};
