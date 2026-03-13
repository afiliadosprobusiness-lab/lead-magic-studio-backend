import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import { AssetLibraryService } from "./asset-library.service";

export class AssetLibraryController {
  constructor(private readonly assetLibraryService: AssetLibraryService) {}

  private getProjectId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  async getProjectAssets(req: Request, res: Response): Promise<void> {
    const response = await this.assetLibraryService.getProjectAssets(req.auth.userId, this.getProjectId(req));
    sendSuccess(res, 200, response);
  }
}
