export abstract class BaseError extends Error {
  abstract statusCode: number;
  abstract code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    };
  }
}

export class BadRequestError extends BaseError {
  statusCode = 400;
  code = 'BAD_REQUEST';

  constructor(message: string, code?: string) {
    super(message);
    if (code) this.code = code;
  }
}

export class UnauthorizedError extends BaseError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
}

export class ForbiddenError extends BaseError {
  statusCode = 403;
  code = 'FORBIDDEN';
}

export class NotFoundError extends BaseError {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(resource: string = 'Resource') {
    super(resource);
  }
}

export class ConflictError extends BaseError {
  statusCode = 409;
  code = 'CONFLICT';
}

export class UnprocessableError extends BaseError {
  statusCode = 422;
  code = 'UNPROCESSABLE';
}

export class RateLimitError extends BaseError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';

  constructor(message: string = 'Too many requests') {
    super(message);
  }
}

export class InternalError extends BaseError {
  statusCode = 500;
  code = 'INTERNAL_ERROR';

  constructor(message: string = 'An unexpected error occurred') {
    super(message);
  }
}

export class ValidationError extends BaseError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  details: Array<{ field: string; message: string }>;

  constructor(details: Array<{ field: string; message: string }>) {
    super(details[0]?.message || 'Validation failed');
    this.details = details;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}