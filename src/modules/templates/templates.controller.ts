import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import type { CreateCopyTemplateDto, ListCopyTemplatesQueryDto, UpdateCopyTemplateDto } from "./templates.types";
import { TemplatesService } from "./templates.service";

export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  private getTemplateId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  async listTemplates(req: Request, res: Response): Promise<void> {
    const query = req.query as unknown as ListCopyTemplatesQueryDto;
    const templates = await this.templatesService.listTemplates(req.auth.userId, query);
    sendSuccess(res, 200, templates);
  }

  async createTemplate(req: Request, res: Response): Promise<void> {
    const payload = req.body as CreateCopyTemplateDto;
    const created = await this.templatesService.createTemplate(req.auth.userId, payload);
    sendSuccess(res, 201, created);
  }

  async updateTemplate(req: Request, res: Response): Promise<void> {
    const payload = req.body as UpdateCopyTemplateDto;
    const updated = await this.templatesService.updateTemplate(req.auth.userId, this.getTemplateId(req), payload);
    sendSuccess(res, 200, updated);
  }

  async deleteTemplate(req: Request, res: Response): Promise<void> {
    await this.templatesService.deleteTemplate(req.auth.userId, this.getTemplateId(req));
    sendSuccess(res, 200, { deleted: true });
  }
}
