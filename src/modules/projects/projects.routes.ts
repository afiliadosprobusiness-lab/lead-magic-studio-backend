import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { GenerationRepository } from "../generation/generation.repository";
import { GenerationService } from "../generation/generation.service";
import { generateProjectSchema } from "../generation/generation.validation";
import { MockupResultsRepository } from "../mockup-results/mockup-results.repository";
import { MockupResultsService } from "../mockup-results/mockup-results.service";
import { ProjectsController } from "./projects.controller";
import { ProjectsRepository } from "./projects.repository";
import { ProjectsService } from "./projects.service";
import { createProjectSchema, duplicateProjectSchema, projectIdParamSchema } from "./projects.validation";

const projectsRepository = new ProjectsRepository();
const generationRepository = new GenerationRepository();
const mockupResultsRepository = new MockupResultsRepository();

const projectsService = new ProjectsService(projectsRepository);
const generationService = new GenerationService(projectsRepository, generationRepository);
const mockupResultsService = new MockupResultsService(projectsRepository, mockupResultsRepository);

const projectsController = new ProjectsController(projectsService, generationService, mockupResultsService);

export const projectsRouter = Router();

projectsRouter.get("/", asyncHandler((req, res) => projectsController.listProjects(req, res)));

projectsRouter.post(
  "/",
  validateRequest({ body: createProjectSchema }),
  asyncHandler((req, res) => projectsController.createProject(req, res))
);

projectsRouter.get(
  "/:id",
  validateRequest({ params: projectIdParamSchema }),
  asyncHandler((req, res) => projectsController.getProjectById(req, res))
);

projectsRouter.post(
  "/:id/duplicate",
  validateRequest({ params: projectIdParamSchema, body: duplicateProjectSchema }),
  asyncHandler((req, res) => projectsController.duplicateProject(req, res))
);

projectsRouter.post(
  "/:id/generate",
  validateRequest({ params: projectIdParamSchema, body: generateProjectSchema }),
  asyncHandler((req, res) => projectsController.startGeneration(req, res))
);

projectsRouter.get(
  "/:id/generation",
  validateRequest({ params: projectIdParamSchema }),
  asyncHandler((req, res) => projectsController.getGenerationStatus(req, res))
);

projectsRouter.get(
  "/:id/results",
  validateRequest({ params: projectIdParamSchema }),
  asyncHandler((req, res) => projectsController.getResults(req, res))
);

