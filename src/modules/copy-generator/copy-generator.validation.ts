import { z } from "zod";

import { COPY_OBJECTIVES, COPY_TONES, PUBLISHER_PLATFORMS } from "./copy-generator.types";

export const copyProjectIdParamSchema = z.object({
  id: z.string().cuid()
});

export const copyIdParamSchema = z.object({
  copyId: z.string().cuid()
});

export const generateProjectCopiesSchema = z.object({
  objective: z.enum(COPY_OBJECTIVES),
  tone: z.enum(COPY_TONES),
  platform: z.enum(PUBLISHER_PLATFORMS).optional(),
  language: z.string().trim().min(2).max(12).optional(),
  templateId: z.string().cuid().optional(),
  variants: z.number().int().min(1).max(6).optional()
});

export const duplicateCopySchema = z.object({
  label: z.string().trim().min(2).max(120).optional()
});

export const updateGeneratedCopySchema = z
  .object({
    objective: z.enum(COPY_OBJECTIVES).optional(),
    tone: z.enum(COPY_TONES).optional(),
    platform: z.union([z.enum(PUBLISHER_PLATFORMS), z.null()]).optional(),
    language: z.string().trim().min(2).max(12).optional(),
    label: z.union([z.string().trim().min(2).max(120), z.null()]).optional(),
    headline: z.string().trim().min(3).max(220).optional(),
    primaryText: z.string().trim().min(5).max(2500).optional(),
    cta: z.string().trim().min(2).max(160).optional(),
    shortCaption: z.string().trim().min(2).max(280).optional(),
    hookVariants: z.array(z.string().trim().min(2).max(180)).min(1).max(8).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });
