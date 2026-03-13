import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { ProjectsRepository } from "../projects/projects.repository";
import { LocalDevProductImageStorage } from "./storage/local-dev-product-image-storage";
import { UploadsController } from "./uploads.controller";
import { UploadsRepository } from "./uploads.repository";
import { UploadsService } from "./uploads.service";
import { uploadProductImagesSchema } from "./uploads.validation";

const projectsRepository = new ProjectsRepository();
const uploadsRepository = new UploadsRepository();
const storage = new LocalDevProductImageStorage();
const uploadsService = new UploadsService(projectsRepository, uploadsRepository, storage);
const uploadsController = new UploadsController(uploadsService);

export const uploadsRouter = Router();

uploadsRouter.post(
  "/product-images",
  validateRequest({ body: uploadProductImagesSchema }),
  asyncHandler((req, res) => uploadsController.uploadProductImages(req, res))
);
