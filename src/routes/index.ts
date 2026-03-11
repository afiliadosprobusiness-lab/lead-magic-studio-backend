import { Router } from "express";

import { healthRouter } from "../modules/health/health.routes";
import { projectsRouter } from "../modules/projects/projects.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/projects", projectsRouter);

