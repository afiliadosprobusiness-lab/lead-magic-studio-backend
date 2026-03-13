import { z } from "zod";

import { COPY_OBJECTIVES, COPY_TONES, PUBLISHER_PLATFORMS } from "../copy-generator/copy-generator.types";

export const copyTemplateIdParamSchema = z.object({
  id: z.string().cuid()
});

export const listCopyTemplatesQuerySchema = z.object({
  includeSystem: z.coerce.boolean().optional(),
  isPreset: z.coerce.boolean().optional(),
  objective: z.enum(COPY_OBJECTIVES).optional(),
  tone: z.enum(COPY_TONES).optional(),
  platform: z.enum(PUBLISHER_PLATFORMS).optional(),
  projectId: z.string().cuid().optional()
});

export const createCopyTemplateSchema = z.object({
  projectId: z.string().cuid().optional(),
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(3).max(400).optional(),
  objective: z.enum(COPY_OBJECTIVES).optional(),
  tone: z.enum(COPY_TONES).optional(),
  platform: z.enum(PUBLISHER_PLATFORMS).optional(),
  language: z.string().trim().min(2).max(12).optional(),
  isSystem: z.boolean().optional(),
  isPreset: z.boolean().optional(),
  templateText: z.string().trim().min(10).max(6000),
  ctaDefault: z.string().trim().min(2).max(160).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
});

export const updateCopyTemplateSchema = z
  .object({
    projectId: z.union([z.string().cuid(), z.null()]).optional(),
    name: z.string().trim().min(3).max(120).optional(),
    description: z.union([z.string().trim().min(3).max(400), z.null()]).optional(),
    objective: z.union([z.enum(COPY_OBJECTIVES), z.null()]).optional(),
    tone: z.union([z.enum(COPY_TONES), z.null()]).optional(),
    platform: z.union([z.enum(PUBLISHER_PLATFORMS), z.null()]).optional(),
    language: z.string().trim().min(2).max(12).optional(),
    isPreset: z.boolean().optional(),
    templateText: z.string().trim().min(10).max(6000).optional(),
    ctaDefault: z.union([z.string().trim().min(2).max(160), z.null()]).optional(),
    metadata: z.union([z.record(z.string(), z.unknown()), z.null()]).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });
