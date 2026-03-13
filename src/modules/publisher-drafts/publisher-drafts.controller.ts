import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import type { CreatePublicationDraftDto, UpdatePublicationDraftDto } from "./publisher-drafts.types";
import { PublisherDraftsService } from "./publisher-drafts.service";

export class PublisherDraftsController {
  constructor(private readonly publisherDraftsService: PublisherDraftsService) {}

  private getProjectId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  private getDraftId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  async createDraft(req: Request, res: Response): Promise<void> {
    const payload = req.body as CreatePublicationDraftDto;
    const draft = await this.publisherDraftsService.createDraft(req.auth.userId, this.getProjectId(req), payload);
    sendSuccess(res, 201, draft);
  }

  async listDrafts(req: Request, res: Response): Promise<void> {
    const response = await this.publisherDraftsService.listDrafts(req.auth.userId, this.getProjectId(req));
    sendSuccess(res, 200, response);
  }

  async getDraftById(req: Request, res: Response): Promise<void> {
    const draft = await this.publisherDraftsService.getDraftById(req.auth.userId, this.getDraftId(req));
    sendSuccess(res, 200, draft);
  }

  async updateDraft(req: Request, res: Response): Promise<void> {
    const payload = req.body as UpdatePublicationDraftDto;
    const updated = await this.publisherDraftsService.updateDraft(req.auth.userId, this.getDraftId(req), payload);
    sendSuccess(res, 200, updated);
  }

  async deleteDraft(req: Request, res: Response): Promise<void> {
    await this.publisherDraftsService.deleteDraft(req.auth.userId, this.getDraftId(req));
    sendSuccess(res, 200, { deleted: true });
  }
}
