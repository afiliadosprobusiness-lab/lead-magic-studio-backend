import { z } from "zod";

export const generateProjectSchema = z.object({
  parts: z.array(z.enum(["landing", "copy", "creatives"])).min(1).max(3).optional()
});

