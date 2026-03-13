import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { ProjectHistoryController } from "./project-history.controller";
import { ProjectHistoryService } from "./project-history.service";
import { projectHistoryProjectIdParamSchema, projectHistoryQuerySchema } from "./project-history.validation";

const projectHistoryService = new ProjectHistoryService();
const projectHistoryController = new ProjectHistoryController(projectHistoryService);

export const projectHistoryRouter = Router();

projectHistoryRouter.get(
  "/projects/:id/history",
  validateRequest({ params: projectHistoryProjectIdParamSchema, query: projectHistoryQuerySchema }),
  asyncHandler((req, res) => projectHistoryController.listProjectHistory(req, res))
);
