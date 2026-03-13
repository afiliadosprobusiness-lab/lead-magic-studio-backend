import { z } from "zod";

import {
  UGC_CONTENT_POLICY_CHECKS,
  UGC_CREATIVE_TYPES,
  UGC_OUTPUT_FORMATS,
  UGC_TARGET_PLATFORMS
} from "./ugc.types";
import { UGC_AVATAR_PRESET_IDS, UGC_SCENE_PRESET_IDS } from "./ugc.presets";

export const ugcJobIdParamSchema = z.object({
  id: z.string().cuid()
});

export const ugcProjectIdParamSchema = z.object({
  projectId: z.string().cuid()
});

export const generateUGCSchema = z.object({
  projectId: z.string().cuid(),
  productImageIds: z.array(z.string().cuid()).min(1).max(8),
  creativeType: z.enum(UGC_CREATIVE_TYPES),
  targetPlatform: z.enum(UGC_TARGET_PLATFORMS),
  scenePreset: z.enum(UGC_SCENE_PRESET_IDS),
  avatarPreset: z.enum(UGC_AVATAR_PRESET_IDS),
  toneStyle: z.string().trim().min(3).max(140),
  customPrompt: z.string().trim().min(3).max(1500).optional(),
  outputFormats: z.array(z.enum(UGC_OUTPUT_FORMATS)).min(1).max(4),
  brandSafeMode: z.boolean().default(true),
  disclosureEnabled: z.boolean().default(true),
  contentPolicyChecks: z.array(z.enum(UGC_CONTENT_POLICY_CHECKS)).min(1).max(5).optional()
});
