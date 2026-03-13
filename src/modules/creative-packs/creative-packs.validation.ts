import { z } from "zod";

import { ASSET_REFERENCE_TYPES } from "../asset-library/asset-library.types";
import { COPY_OBJECTIVES, COPY_TONES, PUBLISHER_PLATFORMS } from "../copy-generator/copy-generator.types";

const assetReferenceSchema = z.object({
  type: z.enum(ASSET_REFERENCE_TYPES),
  id: z.string().cuid(),
  label: z.string().trim().min(2).max(120).optional()
});

export const creativePackProjectIdParamSchema = z.object({
  id: z.string().cuid()
});

export const creativePackIdParamSchema = z.object({
  id: z.string().cuid()
});

export const createCreativePackSchema = z.object({
  name: z.string().trim().min(3).max(140),
  objective: z.enum(COPY_OBJECTIVES).optional(),
  tone: z.enum(COPY_TONES).optional(),
  platform: z.enum(PUBLISHER_PLATFORMS).optional(),
  notes: z.string().trim().min(3).max(1000).optional(),
  createdFromCopyId: z.string().cuid().optional(),
  assets: z.array(assetReferenceSchema).min(1).max(50).optional()
});
