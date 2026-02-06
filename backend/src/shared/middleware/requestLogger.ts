import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import logger from '@shared/utils/logger';

// Extend Express Request to include requestId
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            userId?: string;
            startTime?: number;
        }
    }
}

/**
 * Middleware to add request ID and log HTTP requests
 */
export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Generate unique request ID
    req.requestId = req.headers['x-request-id'] as string || randomUUID();
    req.startTime = Date.now();

    // Extract user ID from auth if available
    if (req.auth?.userId) {
        req.userId = req.auth.userId;
    }

    // Log incoming request
    logger.http('Incoming request', {
        requestId: req.requestId,
        userId: req.userId,
        method: req.method,
        url: req.url,
        path: req.path,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.socket.remoteAddress,
    });

    // Capture response
    const originalSend = res.send;
    res.send = function (data: any): Response {
        res.send = originalSend; // Restore original send

        const duration = req.startTime ? Date.now() - req.startTime : 0;
        const logLevel = res.statusCode >= 500 ? 'error' :
            res.statusCode >= 400 ? 'warn' :
                'http';

        logger.log(logLevel, 'Outgoing response', {
            requestId: req.requestId,
            userId: req.userId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            context: 'HTTP Response',
        });

        return originalSend.call(this, data);
    };

    next();
};

/**
 * Helper to get logger with request context
 */
export const getRequestLogger = (req: Request) => {
    const context = {
        requestId: req.requestId,
        userId: req.userId,
    };

    return {
        info: (message: string, meta?: Record<string, any>) =>
            logger.info(message, { ...context, ...meta }),
        warn: (message: string, meta?: Record<string, any>) =>
            logger.warn(message, { ...context, ...meta }),
        error: (message: string, error?: Error | unknown, meta?: Record<string, any>) => {
            const errorMeta = {
                ...context,
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
        debug: (message: string, meta?: Record<string, any>) =>
            logger.debug(message, { ...context, ...meta }),
    };
};
