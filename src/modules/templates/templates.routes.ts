import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { ProjectsRepository } from "../projects/projects.repository";
import { TemplatesController } from "./templates.controller";
import { TemplatesRepository } from "./templates.repository";
import { TemplatesService } from "./templates.service";
import {
  copyTemplateIdParamSchema,
  createCopyTemplateSchema,
  listCopyTemplatesQuerySchema,
  updateCopyTemplateSchema
} from "./templates.validation";

const projectsRepository = new ProjectsRepository();
const templatesRepository = new TemplatesRepository();
const templatesService = new TemplatesService(projectsRepository, templatesRepository);
const templatesController = new TemplatesController(templatesService);

export const templatesRouter = Router();

templatesRouter.get(
  "/copy-templates",
  validateRequest({ query: listCopyTemplatesQuerySchema }),
  asyncHandler((req, res) => templatesController.listTemplates(req, res))
);

templatesRouter.post(
  "/copy-templates",
  validateRequest({ body: createCopyTemplateSchema }),
  asyncHandler((req, res) => templatesController.createTemplate(req, res))
);

templatesRouter.patch(
  "/copy-templates/:id",
  validateRequest({ params: copyTemplateIdParamSchema, body: updateCopyTemplateSchema }),
  asyncHandler((req, res) => templatesController.updateTemplate(req, res))
);

templatesRouter.delete(
  "/copy-templates/:id",
  validateRequest({ params: copyTemplateIdParamSchema }),
  asyncHandler((req, res) => templatesController.deleteTemplate(req, res))
);
