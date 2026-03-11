import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";

import { logger } from "./config/logger";
import { env } from "./config/env";
import { errorMiddleware } from "./common/middleware/error.middleware";
import { notFoundMiddleware } from "./common/middleware/not-found.middleware";
import { requestContextMiddleware } from "./common/middleware/request-context.middleware";
import { authContextMiddleware } from "./common/middleware/auth-context.middleware";
import { healthRouter } from "./modules/health/health.routes";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(requestContextMiddleware);
  app.use(authContextMiddleware);
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({
        requestId: req.requestId,
        userId: req.auth?.userId ?? null
      })
    })
  );

  app.use("/health", healthRouter);
  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

