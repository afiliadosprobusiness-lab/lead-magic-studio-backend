import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import { UploadsService } from "./uploads.service";
import type { UploadProductImagesDto } from "./uploads.types";

export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  async uploadProductImages(req: Request, res: Response): Promise<void> {
    const payload = req.body as UploadProductImagesDto;
    const response = await this.uploadsService.uploadProductImages(req.auth.userId, payload);
    sendSuccess(res, 201, response);
  }
}
