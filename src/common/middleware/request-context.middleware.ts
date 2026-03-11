import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
  const headerRequestId = req.header("x-request-id");
  const requestId = headerRequestId && headerRequestId.trim().length > 0 ? headerRequestId : randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  next();
}

