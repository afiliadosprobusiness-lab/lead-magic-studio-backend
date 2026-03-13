import type { CopyGenerationContext, CopyGenerationVariant } from "../copy-generator.types";

export interface CopyGenerationEngine {
  generate(context: CopyGenerationContext): Promise<CopyGenerationVariant[]>;
}
