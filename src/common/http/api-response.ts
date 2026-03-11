import type { Response } from "express";

type ApiMeta = Record<string, unknown>;

export function sendSuccess<T>(res: Response, statusCode: number, data: T, meta?: ApiMeta): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {})
  });
}

