import { Router } from "express";

import { asyncHandler } from "../../common/http/async-handler";
import { validateRequest } from "../../common/middleware/validate-request.middleware";
import { AssetLibraryRepository } from "../asset-library/asset-library.repository";
import { ProjectsRepository } from "../projects/projects.repository";
import { PublisherDraftsController } from "./publisher-drafts.controller";
import { PublisherDraftsRepository } from "./publisher-drafts.repository";
import { PublisherDraftsService } from "./publisher-drafts.service";
import {
  createPublicationDraftSchema,
  publicationDraftIdParamSchema,
  publicationDraftProjectIdParamSchema,
  updatePublicationDraftSchema
} from "./publisher-drafts.validation";

const projectsRepository = new ProjectsRepository();
const publisherDraftsRepository = new PublisherDraftsRepository();
const assetLibraryRepository = new AssetLibraryRepository();
const publisherDraftsService = new PublisherDraftsService(
  projectsRepository,
  publisherDraftsRepository,
  assetLibraryRepository
);
const publisherDraftsController = new PublisherDraftsController(publisherDraftsService);

export const publisherDraftsRouter = Router();

publisherDraftsRouter.post(
  "/projects/:id/publication-drafts",
  validateRequest({ params: publicationDraftProjectIdParamSchema, body: createPublicationDraftSchema }),
  asyncHandler((req, res) => publisherDraftsController.createDraft(req, res))
);

publisherDraftsRouter.get(
  "/projects/:id/publication-drafts",
  validateRequest({ params: publicationDraftProjectIdParamSchema }),
  asyncHandler((req, res) => publisherDraftsController.listDrafts(req, res))
);

publisherDraftsRouter.get(
  "/publication-drafts/:id",
  validateRequest({ params: publicationDraftIdParamSchema }),
  asyncHandler((req, res) => publisherDraftsController.getDraftById(req, res))
);

publisherDraftsRouter.patch(
  "/publication-drafts/:id",
  validateRequest({ params: publicationDraftIdParamSchema, body: updatePublicationDraftSchema }),
  asyncHandler((req, res) => publisherDraftsController.updateDraft(req, res))
);

publisherDraftsRouter.delete(
  "/publication-drafts/:id",
  validateRequest({ params: publicationDraftIdParamSchema }),
  asyncHandler((req, res) => publisherDraftsController.deleteDraft(req, res))
);
