import { z } from "zod";

import { ASSET_REFERENCE_TYPES } from "../asset-library/asset-library.types";
import { PUBLISHER_PLATFORMS } from "../copy-generator/copy-generator.types";
import { PUBLICATION_DRAFT_STATUSES } from "./publisher-drafts.types";

const assetReferenceSchema = z.object({
  type: z.enum(ASSET_REFERENCE_TYPES),
  id: z.string().cuid(),
  label: z.string().trim().min(2).max(120).optional()
});

export const publicationDraftProjectIdParamSchema = z.object({
  id: z.string().cuid()
});

export const publicationDraftIdParamSchema = z.object({
  id: z.string().cuid()
});

export const createPublicationDraftSchema = z.object({
  platform: z.enum(PUBLISHER_PLATFORMS),
  selectedCopyId: z.string().cuid().optional(),
  creativePackId: z.string().cuid().optional(),
  selectedAssetRefs: z.array(assetReferenceSchema).max(50).optional(),
  captionText: z.string().trim().min(2).max(1000),
  finalText: z.string().trim().min(2).max(2500).optional(),
  ctaText: z.string().trim().min(2).max(160).optional(),
  finalUrl: z.string().trim().url().max(2048).optional(),
  status: z.enum(PUBLICATION_DRAFT_STATUSES).optional(),
  scheduledAt: z.coerce.date().optional()
});

export const updatePublicationDraftSchema = z
  .object({
    platform: z.enum(PUBLISHER_PLATFORMS).optional(),
    selectedCopyId: z.union([z.string().cuid(), z.null()]).optional(),
    creativePackId: z.union([z.string().cuid(), z.null()]).optional(),
    selectedAssetRefs: z.array(assetReferenceSchema).max(50).optional(),
    captionText: z.string().trim().min(2).max(1000).optional(),
    finalText: z.union([z.string().trim().min(2).max(2500), z.null()]).optional(),
    ctaText: z.union([z.string().trim().min(2).max(160), z.null()]).optional(),
    finalUrl: z.union([z.string().trim().url().max(2048), z.null()]).optional(),
    status: z.enum(PUBLICATION_DRAFT_STATUSES).optional(),
    scheduledAt: z.union([z.coerce.date(), z.null()]).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });
