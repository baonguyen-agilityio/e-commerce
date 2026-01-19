export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  ALREADY_EXISTS = "ALREADY_EXISTS",
  INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
  CART_EMPTY = "CART_EMPTY",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  BAD_REQUEST = "BAD_REQUEST",
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ErrorResponse {
  message: string;
  code?: ErrorCode;
  details?: any;
  statusCode?: number;
}
