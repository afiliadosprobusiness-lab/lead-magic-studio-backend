import { z } from "zod";

export const assetLibraryProjectIdParamSchema = z.object({
  id: z.string().cuid()
});
