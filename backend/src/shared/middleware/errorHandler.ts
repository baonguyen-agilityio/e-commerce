import { Request, Response, NextFunction } from "express";
import { BaseError } from "../errors";

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
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });

  if (err instanceof BaseError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  const response: ErrorResponse = {
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    code: 'INTERNAL_ERROR',
  };
  res.status(500).json(response);
};