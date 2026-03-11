import type { NextFunction, Request, Response } from "express";

import { logger } from "../../config/logger";
import { AppError } from "../errors/app-error";

export function errorMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId: req.requestId
      }
    });
    return;
  }

  logger.error(
    {
      err: error,
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl
    },
    "Unhandled error"
  );

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error happened",
      requestId: req.requestId
    }
  });
}

