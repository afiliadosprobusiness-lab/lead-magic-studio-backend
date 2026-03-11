import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./database/prisma";

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();

    const app = createApp();

    app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          apiPrefix: env.API_PREFIX,
          nodeEnv: env.NODE_ENV
        },
        "LeadMagic backend started"
      );
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to bootstrap server");
    process.exit(1);
  }
}

void bootstrap();

