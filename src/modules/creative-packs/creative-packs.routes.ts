import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { AssetLibraryRepository } from "../asset-library/asset-library.repository";
import { CopyGeneratorRepository } from "../copy-generator/copy-generator.repository";
import { ProjectsRepository } from "../projects/projects.repository";
import { CreativePacksController } from "./creative-packs.controller";
import { CreativePacksRepository } from "./creative-packs.repository";
import { CreativePacksService } from "./creative-packs.service";
import {
  creativePackIdParamSchema,
  creativePackProjectIdParamSchema,
  createCreativePackSchema
} from "./creative-packs.validation";

const projectsRepository = new ProjectsRepository();
const creativePacksRepository = new CreativePacksRepository();
const assetLibraryRepository = new AssetLibraryRepository();
const copyGeneratorRepository = new CopyGeneratorRepository();
const creativePacksService = new CreativePacksService(
  projectsRepository,
  creativePacksRepository,
  assetLibraryRepository,
  copyGeneratorRepository
);
const creativePacksController = new CreativePacksController(creativePacksService);

export const creativePacksRouter = Router();

creativePacksRouter.post(
  "/projects/:id/creative-packs",
  validateRequest({ params: creativePackProjectIdParamSchema, body: createCreativePackSchema }),
  asyncHandler((req, res) => creativePacksController.createCreativePack(req, res))
);

creativePacksRouter.get(
  "/projects/:id/creative-packs",
  validateRequest({ params: creativePackProjectIdParamSchema }),
  asyncHandler((req, res) => creativePacksController.listCreativePacks(req, res))
);

creativePacksRouter.get(
  "/creative-packs/:id",
  validateRequest({ params: creativePackIdParamSchema }),
  asyncHandler((req, res) => creativePacksController.getCreativePackById(req, res))
);
