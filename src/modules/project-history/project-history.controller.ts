import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import { ProjectHistoryService } from "./project-history.service";

export class ProjectHistoryController {
  constructor(private readonly projectHistoryService: ProjectHistoryService) {}

  private getProjectId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  async listProjectHistory(req: Request, res: Response): Promise<void> {
    const limit = Number(req.query.limit ?? 100);
    const history = await this.projectHistoryService.listProjectHistory(req.auth.userId, this.getProjectId(req), limit);

    sendSuccess(res, 200, {
      projectId: this.getProjectId(req),
      events: history
    });
  }
}
