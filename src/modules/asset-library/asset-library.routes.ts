import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { ProjectsRepository } from "../projects/projects.repository";
import { AssetLibraryController } from "./asset-library.controller";
import { AssetLibraryRepository } from "./asset-library.repository";
import { AssetLibraryService } from "./asset-library.service";
import { assetLibraryProjectIdParamSchema } from "./asset-library.validation";

const projectsRepository = new ProjectsRepository();
const assetLibraryRepository = new AssetLibraryRepository();
const assetLibraryService = new AssetLibraryService(projectsRepository, assetLibraryRepository);
const assetLibraryController = new AssetLibraryController(assetLibraryService);

export const assetLibraryRouter = Router();

assetLibraryRouter.get(
  "/projects/:id/assets",
  validateRequest({ params: assetLibraryProjectIdParamSchema }),
  asyncHandler((req, res) => assetLibraryController.getProjectAssets(req, res))
);
