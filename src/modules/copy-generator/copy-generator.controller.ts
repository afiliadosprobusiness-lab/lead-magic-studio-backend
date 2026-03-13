import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import type { DuplicateGeneratedCopyDto, GenerateProjectCopiesDto, UpdateGeneratedCopyDto } from "./copy-generator.types";
import { CopyGeneratorService } from "./copy-generator.service";

export class CopyGeneratorController {
  constructor(private readonly copyGeneratorService: CopyGeneratorService) {}

  private getProjectId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  private getCopyId(req: Request): string {
    return Array.isArray(req.params.copyId) ? req.params.copyId[0] : req.params.copyId;
  }

  async generateProjectCopies(req: Request, res: Response): Promise<void> {
    const payload = req.body as GenerateProjectCopiesDto;
    const response = await this.copyGeneratorService.generateProjectCopies(req.auth.userId, this.getProjectId(req), payload);
    sendSuccess(res, 201, response);
  }

  async listProjectCopies(req: Request, res: Response): Promise<void> {
    const response = await this.copyGeneratorService.listProjectCopies(req.auth.userId, this.getProjectId(req));
    sendSuccess(res, 200, response);
  }

  async getCopyById(req: Request, res: Response): Promise<void> {
    const copy = await this.copyGeneratorService.getCopyById(req.auth.userId, this.getCopyId(req));
    sendSuccess(res, 200, copy);
  }

  async duplicateCopy(req: Request, res: Response): Promise<void> {
    const payload = req.body as DuplicateGeneratedCopyDto;
    const duplicated = await this.copyGeneratorService.duplicateCopy(req.auth.userId, this.getCopyId(req), payload);
    sendSuccess(res, 201, duplicated);
  }

  async updateCopy(req: Request, res: Response): Promise<void> {
    const payload = req.body as UpdateGeneratedCopyDto;
    const updated = await this.copyGeneratorService.updateCopy(req.auth.userId, this.getCopyId(req), payload);
    sendSuccess(res, 200, updated);
  }

  async deleteCopy(req: Request, res: Response): Promise<void> {
    await this.copyGeneratorService.deleteCopy(req.auth.userId, this.getCopyId(req));
    sendSuccess(res, 200, { deleted: true });
  }
}
