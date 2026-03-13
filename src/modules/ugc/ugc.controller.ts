import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import { UGCService } from "./ugc.service";
import type { GenerateUGCDto } from "./ugc.types";

export class UGCController {
  constructor(private readonly ugcService: UGCService) {}

  private getJobId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  private getProjectId(req: Request): string {
    return Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
  }

  async generate(req: Request, res: Response): Promise<void> {
    const payload = req.body as GenerateUGCDto;
    const response = await this.ugcService.generate(req.auth.userId, payload);
    sendSuccess(res, 202, response);
  }

  async getJob(req: Request, res: Response): Promise<void> {
    const job = await this.ugcService.getJob(req.auth.userId, this.getJobId(req));
    sendSuccess(res, 200, job);
  }

  async getJobResults(req: Request, res: Response): Promise<void> {
    const result = await this.ugcService.getJobResults(req.auth.userId, this.getJobId(req));
    sendSuccess(res, 200, result);
  }

  async listJobsByProject(req: Request, res: Response): Promise<void> {
    const response = await this.ugcService.listJobsByProject(req.auth.userId, this.getProjectId(req));
    sendSuccess(res, 200, response);
  }

  async getScenePresets(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, 200, this.ugcService.getScenePresets());
  }

  async getAvatarPresets(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, 200, this.ugcService.getAvatarPresets());
  }
}
