import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { ProjectsRepository } from "../projects/projects.repository";
import { UGCController } from "./ugc.controller";
import { UGCRepository } from "./ugc.repository";
import { UGCService } from "./ugc.service";
import { generateUGCSchema, ugcJobIdParamSchema, ugcProjectIdParamSchema } from "./ugc.validation";

const projectsRepository = new ProjectsRepository();
const ugcRepository = new UGCRepository();
const ugcService = new UGCService(projectsRepository, ugcRepository);
const ugcController = new UGCController(ugcService);

export const ugcRouter = Router();

ugcRouter.get("/presets/scenes", asyncHandler((req, res) => ugcController.getScenePresets(req, res)));
ugcRouter.get("/presets/avatars", asyncHandler((req, res) => ugcController.getAvatarPresets(req, res)));

ugcRouter.post(
  "/generate",
  validateRequest({ body: generateUGCSchema }),
  asyncHandler((req, res) => ugcController.generate(req, res))
);

ugcRouter.get(
  "/jobs/:id",
  validateRequest({ params: ugcJobIdParamSchema }),
  asyncHandler((req, res) => ugcController.getJob(req, res))
);

ugcRouter.get(
  "/jobs/:id/results",
  validateRequest({ params: ugcJobIdParamSchema }),
  asyncHandler((req, res) => ugcController.getJobResults(req, res))
);

ugcRouter.get(
  "/projects/:projectId/jobs",
  validateRequest({ params: ugcProjectIdParamSchema }),
  asyncHandler((req, res) => ugcController.listJobsByProject(req, res))
);
