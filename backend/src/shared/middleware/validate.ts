import { ZodType } from "zod";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../errors";

type Source = 'body' | 'query' | 'params';

export const validate = (schema: ZodType, source: Source = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = req[source];
    const result = schema.safeParse(data);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      throw new ValidationError(details);
    }

    Object.defineProperty(req, source, {
      value: result.data,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  };
};