import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import type { CreateCreativePackDto } from "./creative-packs.types";
import { CreativePacksService } from "./creative-packs.service";

export class CreativePacksController {
  constructor(private readonly creativePacksService: CreativePacksService) {}

  private getProjectId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  private getCreativePackId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  async createCreativePack(req: Request, res: Response): Promise<void> {
    const payload = req.body as CreateCreativePackDto;
    const created = await this.creativePacksService.createCreativePack(req.auth.userId, this.getProjectId(req), payload);
    sendSuccess(res, 201, created);
  }

  async listCreativePacks(req: Request, res: Response): Promise<void> {
    const response = await this.creativePacksService.listCreativePacks(req.auth.userId, this.getProjectId(req));
    sendSuccess(res, 200, response);
  }

  async getCreativePackById(req: Request, res: Response): Promise<void> {
    const creativePack = await this.creativePacksService.getCreativePackById(req.auth.userId, this.getCreativePackId(req));
    sendSuccess(res, 200, creativePack);
  }
}
