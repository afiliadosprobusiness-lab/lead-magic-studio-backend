import { z } from "zod";

import { PRODUCT_IMAGE_ALLOWED_MIME_TYPES } from "./uploads.types";

export const uploadProductImagesSchema = z.object({
  projectId: z.string().cuid(),
  files: z
    .array(
      z.object({
        fileName: z.string().trim().min(1).max(180),
        mimeType: z.enum(PRODUCT_IMAGE_ALLOWED_MIME_TYPES),
        contentBase64: z.string().trim().min(20).max(16_000_000)
      })
    )
    .min(1)
    .max(8)
});
