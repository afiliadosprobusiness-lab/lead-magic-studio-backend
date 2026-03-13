import type { CopyGenerationEngine } from "./copy-generation-engine";
import type { CopyGenerationContext, CopyGenerationVariant } from "../copy-generator.types";

const OBJECTIVE_ANGLE: Record<CopyGenerationContext["objective"], string> = {
  venta_directa: "orientada a conversion inmediata",
  awareness: "centrada en recordacion y presencia de marca",
  remarketing: "disenada para reactivar interesados",
  lanzamiento: "enfocada en novedad y momentum",
  oferta_urgencia: "con foco en escasez y cierre rapido"
};

const TONE_STYLE: Record<CopyGenerationContext["tone"], string> = {
  agresivo: "directo, retador y de alta energia",
  premium: "sofisticado, exclusivo y aspiracional",
  emocional: "cercano, humano y narrativo",
  directo: "claro, concreto y sin rodeos",
  minimalista: "simple, limpio y enfocado"
};

function makeHookVariants(context: CopyGenerationContext, index: number): string[] {
  return [
    `${context.input.targetAudience}: ${context.input.painPoints[0] ?? "necesita resultados"} (${index + 1})`,
    `${context.input.offerName} para ${context.objective.replace("_", " ")}`,
    `${context.input.benefits[0] ?? "mejores conversiones"} sin complejidad`
  ];
}

export class MockCopyGenerationEngine implements CopyGenerationEngine {
  async generate(context: CopyGenerationContext): Promise<CopyGenerationVariant[]> {
    const variants: CopyGenerationVariant[] = [];

    for (let index = 0; index < context.variants; index += 1) {
      const variantNumber = index + 1;
      const objectiveAngle = OBJECTIVE_ANGLE[context.objective];
      const toneStyle = TONE_STYLE[context.tone];
      const cta = context.ctaDefault ?? context.input.callToAction;
      const platformHint = context.platform ? ` para ${context.platform}` : "";
      const templateHint = context.templateName ? ` usando template ${context.templateName}` : "";

      variants.push({
        label: `Variante ${variantNumber}`,
        headline: `${context.input.offerName}${platformHint}: ${context.input.benefits[0] ?? "mas resultados"}`,
        primaryText: `${context.input.offerDescription} Propuesta ${objectiveAngle} con estilo ${toneStyle}${templateHint}.`,
        cta,
        shortCaption: `${context.input.uniqueValueProposition} | ${context.input.targetAudience}`,
        hookVariants: makeHookVariants(context, index),
        rawProviderResponse: {
          provider: "mock-copy-engine",
          objective: context.objective,
          tone: context.tone,
          language: context.language,
          templateText: context.templateText ?? null
        }
      });
    }

    return variants;
  }
}
