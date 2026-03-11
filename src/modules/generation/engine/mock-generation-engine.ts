import type { GenerationEngine } from "./generation-engine";
import type { GenerationContext, GenerationResultPayload } from "../generation.types";

export class MockGenerationEngine implements GenerationEngine {
  async generate(context: GenerationContext): Promise<GenerationResultPayload> {
    const { input, requestedParts } = context;

    const result: GenerationResultPayload = {};

    if (requestedParts.includes("landing")) {
      result.landing = {
        headline: `${input.offerName}: convierte mas leads con una propuesta clara`,
        subheadline: `Disenado para ${input.targetAudience.toLowerCase()} con un enfoque ${input.tone.toLowerCase()}.`,
        ctaText: input.callToAction,
        sections: [
          {
            title: "Problema principal",
            description: input.painPoints[0] ?? "No definido"
          },
          {
            title: "Beneficio principal",
            description: input.benefits[0] ?? "No definido"
          },
          {
            title: "Diferenciador",
            description: input.uniqueValueProposition
          }
        ]
      };
    }

    if (requestedParts.includes("copy")) {
      result.copy = {
        adPrimaryText: `${input.offerDescription} Enfocado en resolver: ${input.painPoints[0] ?? "dolor principal"}.`,
        adHeadline: `${input.offerName} para ${input.targetAudience}`,
        adDescription: `Propuesta: ${input.uniqueValueProposition}.`,
        emailSubject: `${input.offerName}: una opcion directa para ${input.targetAudience}`,
        emailBody: `Hola,\n\nSi hoy tu mayor reto es "${input.painPoints[0] ?? "captar mejores leads"}", esta propuesta puede ayudarte.\n\n${input.offerDescription}\n\nCTA: ${input.callToAction}`,
        salesScriptHook: `Si pudieras eliminar "${input.painPoints[0] ?? "tu principal friccion"}" en los proximos 30 dias, te interesaria conocer como?`
      };
    }

    if (requestedParts.includes("creatives")) {
      result.creatives = {
        hooks: [
          `Cansado de ${input.painPoints[0] ?? "perder oportunidades"}?`,
          `La forma mas clara de lograr ${input.benefits[0] ?? "mejores resultados"}`
        ],
        visualDirections: [
          "Antes vs Despues del proceso comercial",
          "Checklist visual de pain points y solucion"
        ],
        concepts: [
          {
            title: "Concepto 1 - Problema visible",
            visualAngle: "Escena de frustracion del buyer persona",
            message: `Muestra el dolor: ${input.painPoints[0] ?? "falta de claridad"}`,
            format: "image"
          },
          {
            title: "Concepto 2 - Solucion concreta",
            visualAngle: "Transformacion y resultado final",
            message: `Beneficio: ${input.benefits[0] ?? "crecimiento"} con ${input.offerName}`,
            format: "video"
          }
        ]
      };
    }

    return result;
  }
}
