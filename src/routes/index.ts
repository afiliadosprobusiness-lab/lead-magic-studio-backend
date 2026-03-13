import { Router } from "express";

import { assetLibraryRouter } from "../modules/asset-library/asset-library.routes";
import { copyGeneratorRouter } from "../modules/copy-generator/copy-generator.routes";
import { creativePacksRouter } from "../modules/creative-packs/creative-packs.routes";
import { healthRouter } from "../modules/health/health.routes";
import { projectHistoryRouter } from "../modules/project-history/project-history.routes";
import { publisherDraftsRouter } from "../modules/publisher-drafts/publisher-drafts.routes";
import { projectsRouter } from "../modules/projects/projects.routes";
import { templatesRouter } from "../modules/templates/templates.routes";
import { ugcRouter } from "../modules/ugc/ugc.routes";
import { uploadsRouter } from "../modules/uploads/uploads.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/ugc", ugcRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/", copyGeneratorRouter);
apiRouter.use("/", templatesRouter);
apiRouter.use("/", creativePacksRouter);
apiRouter.use("/", assetLibraryRouter);
apiRouter.use("/", publisherDraftsRouter);
apiRouter.use("/", projectHistoryRouter);
