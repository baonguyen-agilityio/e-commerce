import { Request, Response, NextFunction } from "express";
import { BaseError } from "../errors";
import { loggers } from "@shared/utils/logger";

export interface ErrorResponse {
  message: string;
  code: string;
  details?: Array<{ field: string; message: string }>;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const logContext = {
    requestId: req.requestId,
    userId: req.userId,
    method: req.method,
    path: req.path,
    url: req.url,
    context: 'ErrorHandler',
  };

  // Log based on error type
  if (err instanceof BaseError) {
    // Expected errors (4xx) - log as warning
    if (err.statusCode < 500) {
      const logMeta: any = {
        ...logContext,
        statusCode: err.statusCode,
        errorCode: err.code,
      };

      // Add details only if it's a ValidationError
      if ('details' in err) {
        logMeta.details = err.details;
      }

      loggers.warn(`Client error: ${err.message}`, logMeta);
    } else {
      // Server errors (5xx) - log as error
      loggers.error(`Server error: ${err.message}`, err, logContext);
    }

    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Unexpected errors - always log as error
  loggers.error('Unexpected error occurred', err, {
    ...logContext,
    errorName: err.name,
  });

  const response: ErrorResponse = {
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    code: 'INTERNAL_ERROR',
  };
  res.status(500).json(response);
};