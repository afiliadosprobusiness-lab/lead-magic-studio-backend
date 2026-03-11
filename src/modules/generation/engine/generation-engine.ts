import type { GenerationContext, GenerationResultPayload } from "../generation.types";

export interface GenerationEngine {
  generate(context: GenerationContext): Promise<GenerationResultPayload>;
}

