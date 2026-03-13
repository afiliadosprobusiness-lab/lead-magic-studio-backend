import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { ProjectsRepository } from "../projects/projects.repository";
import { CopyGeneratorController } from "./copy-generator.controller";
import { CopyGeneratorRepository } from "./copy-generator.repository";
import { CopyGeneratorService } from "./copy-generator.service";
import {
  copyIdParamSchema,
  copyProjectIdParamSchema,
  duplicateCopySchema,
  generateProjectCopiesSchema,
  updateGeneratedCopySchema
} from "./copy-generator.validation";

const projectsRepository = new ProjectsRepository();
const copyGeneratorRepository = new CopyGeneratorRepository();
const copyGeneratorService = new CopyGeneratorService(projectsRepository, copyGeneratorRepository);
const copyGeneratorController = new CopyGeneratorController(copyGeneratorService);

export const copyGeneratorRouter = Router();

copyGeneratorRouter.post(
  "/projects/:id/copies/generate",
  validateRequest({ params: copyProjectIdParamSchema, body: generateProjectCopiesSchema }),
  asyncHandler((req, res) => copyGeneratorController.generateProjectCopies(req, res))
);

copyGeneratorRouter.get(
  "/projects/:id/copies",
  validateRequest({ params: copyProjectIdParamSchema }),
  asyncHandler((req, res) => copyGeneratorController.listProjectCopies(req, res))
);

copyGeneratorRouter.get(
  "/copies/:copyId",
  validateRequest({ params: copyIdParamSchema }),
  asyncHandler((req, res) => copyGeneratorController.getCopyById(req, res))
);

copyGeneratorRouter.post(
  "/copies/:copyId/duplicate",
  validateRequest({ params: copyIdParamSchema, body: duplicateCopySchema }),
  asyncHandler((req, res) => copyGeneratorController.duplicateCopy(req, res))
);

copyGeneratorRouter.patch(
  "/copies/:copyId",
  validateRequest({ params: copyIdParamSchema, body: updateGeneratedCopySchema }),
  asyncHandler((req, res) => copyGeneratorController.updateCopy(req, res))
);

copyGeneratorRouter.delete(
  "/copies/:copyId",
  validateRequest({ params: copyIdParamSchema }),
  asyncHandler((req, res) => copyGeneratorController.deleteCopy(req, res))
);
