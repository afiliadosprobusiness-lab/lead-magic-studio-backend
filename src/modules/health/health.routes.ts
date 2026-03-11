import { Router } from "express";

import { HealthController } from "./health.controller";

const healthController = new HealthController();

export const healthRouter = Router();

healthRouter.get("/", (req, res) => healthController.check(req, res));

