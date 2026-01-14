import { ZodType } from "zod";
import { NextFunction, Request, Response } from "express";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.log(result.error);
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      res.status(400).json({
        message: errors[0].message,
        details: errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
};
