import { z } from "zod";

export const projectHistoryProjectIdParamSchema = z.object({
  id: z.string().cuid()
});

export const projectHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100).optional()
});
