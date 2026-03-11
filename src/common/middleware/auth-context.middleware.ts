import type { NextFunction, Request, Response } from "express";

import { env } from "../../config/env";

export function authContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const userHeader = req.header("x-user-id");
  const userId = userHeader && userHeader.trim().length > 0 ? userHeader.trim() : env.DEFAULT_USER_ID;

  req.auth = {
    userId,
    isAuthenticated: Boolean(userHeader)
  };

  next();
}

