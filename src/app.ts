import cors, { type CorsOptions } from "cors";
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

function normalizeOrigin(origin: string): string | null {
  try {
    const parsedUrl = new URL(origin);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null;
    }

    return `${parsedUrl.protocol}//${parsedUrl.host}`.toLowerCase();
  } catch {
    return null;
  }
}

function isOriginAllowed(origin: string): boolean {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) {
    return false;
  }

  if (env.CORS_ALLOWED_ORIGINS.includes(normalizedOrigin)) {
    return true;
  }

  const hostname = new URL(normalizedOrigin).hostname.toLowerCase();

  return env.CORS_ALLOWED_ORIGIN_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));
}

export function createApp() {
  const app = express();
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      logger.warn({ origin }, "CORS origin blocked");
      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "x-request-id"],
    exposedHeaders: ["x-request-id"],
    maxAge: 86400
  };

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "15mb" }));
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
