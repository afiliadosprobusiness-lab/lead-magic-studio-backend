import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

import { AppError } from "../errors/app-error";

type ValidationSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body) as Request["body"];
      }

      if (schema.params) {
        req.params = schema.params.parse(req.params) as Request["params"];
      }

      if (schema.query) {
        const parsedQuery = schema.query.parse(req.query) as Request["query"];

        // Express 5 exposes `req.query` via a getter, so direct assignment throws.
        Object.defineProperty(req, "query", {
          configurable: true,
          enumerable: true,
          value: parsedQuery,
          writable: true
        });
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw AppError.badRequest("Validation failed", {
          fieldErrors: error.flatten().fieldErrors,
          formErrors: error.flatten().formErrors
        });
      }

      next(error);
    }
  };
}
