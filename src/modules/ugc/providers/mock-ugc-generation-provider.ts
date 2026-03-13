import type {
  GenerateUGCDto,
  UGCCreativeVariant,
  UGCGenerationResultPayload,
  UGCImageReference,
  UGCOutputFormat
} from "../ugc.types";
import type { UGCGenerationProvider, UGCProviderContext } from "./ugc-generation-provider";

function buildVariant(
  request: GenerateUGCDto,
  variantId: string,
  title: string,
  concept: string,
  sceneDirection: string,
  avatarDirection: string
): UGCCreativeVariant {
  return {
    id: variantId,
    category: request.creativeType,
    title,
    concept,
    sceneDirection,
    avatarDirection,
    formatRecommendations: request.outputFormats,
    imageResultReference: `placeholder://${variantId}`,
    disclosureRequired: request.disclosureEnabled
  };
}

function buildPlacementFormats(outputFormats: UGCOutputFormat[]): UGCOutputFormat[] {
  return Array.from(new Set(outputFormats));
}

export class MockUGCGenerationProvider implements UGCGenerationProvider {
  async generate(
    context: UGCProviderContext
  ): Promise<Omit<UGCGenerationResultPayload, "safetyMetadata" | "disclosureFlags">> {
    const { projectName, request } = context;

    const creativeVariants: UGCCreativeVariant[] = [
      buildVariant(
        request,
        `${request.creativeType}-v1`,
        "Concept Variant 1",
        `Producto en contexto ${request.scenePreset} con foco en propuesta de valor para ${request.targetPlatform}.`,
        `Escena ${request.scenePreset} con framing centrado en atributos visuales del producto.`,
        `Avatar ${request.avatarPreset} narrando beneficios en tono ${request.toneStyle}.`
      ),
      buildVariant(
        request,
        `${request.creativeType}-v2`,
        "Concept Variant 2",
        `Composicion alternativa para ${projectName} orientada a performance ads en ${request.targetPlatform}.`,
        `Plano secundario con detalle de uso y contraste limpio de marca.`,
        `Avatar ${request.avatarPreset} en formato demostrativo de creator-style ad.`
      )
    ];

    const imageResultReferences: UGCImageReference[] = creativeVariants.map((variant) => ({
      variantId: variant.id,
      reference: variant.imageResultReference,
      status: "placeholder"
    }));

    return {
      creativeVariants,
      imageResultReferences,
      hookSuggestions: [
        `Descubre una forma sintetica de presentar ${projectName} en anuncios.`,
        `Creator-style ads listos para test A/B en ${request.targetPlatform}.`,
        "Transforma fotos de producto en ideas visuales accionables."
      ],
      shortCopySuggestions: [
        `${projectName}: visuales publicitarios sinteticos, listos para iterar.`,
        "Escenas lifestyle y creator-style sin producir testimonios reales.",
        "Activa creativos brand-safe con disclosure claro."
      ],
      ctaSuggestions: ["Prueba una variacion", "Explora nuevas escenas", "Solicita demo"],
      placementFormats: buildPlacementFormats(request.outputFormats)
    };
  }
}
