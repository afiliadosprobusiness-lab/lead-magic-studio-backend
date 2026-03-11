import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";

export class HealthController {
  check(_req: Request, res: Response): void {
    sendSuccess(res, 200, {
      status: "ok",
      service: "lead-magic-studio-backend",
      timestamp: new Date().toISOString()
    });
  }
}

