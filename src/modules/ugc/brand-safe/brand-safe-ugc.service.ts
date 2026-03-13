import { AppError } from "../../../common/errors/app-error";
import type { GenerateUGCDto, UGCContentPolicyCheck, UGCCreativeVariant, UGCGenerationResultPayload } from "../ugc.types";
import { UGC_CONTENT_POLICY_CHECKS } from "../ugc.types";

type BrandSafeRequestAssessment = {
  appliedChecks: UGCContentPolicyCheck[];
  warnings: string[];
};

type BrandSafeOutputAssessment = {
  filteredResult: Omit<UGCGenerationResultPayload, "safetyMetadata" | "disclosureFlags">;
  blockedClaims: string[];
  warnings: string[];
};

const CLAIM_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "real customer claim", pattern: /\b(soy|i am)\s+(un|a)?\s*(cliente|real customer)\b/i },
  { label: "real testimonial claim", pattern: /\b(testimonio|testimonial|reseña|review)\s+(real|aut[eé]ntic[ao])\b/i },
  { label: "invented personal experience", pattern: /\b(mi experiencia|my experience|yo us[eé]|i used this)\b/i },
  { label: "unverified concrete result", pattern: /\b(resultados?\s+garantizados?|guaranteed results?)\b/i }
];

const MISLEADING_NAMING_PATTERN = /\b(real|verified|authentic|customer[-_\s]?voice)\b/i;
const DEFAULT_DISCLOSURE_LABEL = "AI-generated synthetic ad concept. Not a real customer testimonial.";

function extractBlockedClaims(value: string): string[] {
  const matches: string[] = [];

  for (const { label, pattern } of CLAIM_PATTERNS) {
    if (pattern.test(value)) {
      matches.push(label);
    }
  }

  return matches;
}

function normalizeChecks(checks?: UGCContentPolicyCheck[]): UGCContentPolicyCheck[] {
  if (!checks || checks.length === 0) {
    return [...UGC_CONTENT_POLICY_CHECKS];
  }

  return Array.from(new Set(checks));
}

function shouldKeepText(value: string, blockedClaims: string[]): boolean {
  const found = extractBlockedClaims(value);

  if (found.length === 0) {
    return true;
  }

  blockedClaims.push(...found);
  return false;
}

export class BrandSafeUGCService {
  enforceRequestPolicy(payload: GenerateUGCDto): BrandSafeRequestAssessment {
    const appliedChecks = normalizeChecks(payload.contentPolicyChecks);
    const warnings: string[] = [];

    if (payload.brandSafeMode && !payload.disclosureEnabled) {
      throw AppError.badRequest("disclosureEnabled must be true when brandSafeMode is enabled");
    }

    const requestTextSamples = [payload.toneStyle, payload.customPrompt].filter((value): value is string => Boolean(value));
    const blockedClaims = requestTextSamples.flatMap(extractBlockedClaims);

    if (blockedClaims.length > 0) {
      throw AppError.badRequest("Request includes prohibited claims for synthetic UGC ads", {
        blockedClaims: Array.from(new Set(blockedClaims))
      });
    }

    if (MISLEADING_NAMING_PATTERN.test(payload.scenePreset) || MISLEADING_NAMING_PATTERN.test(payload.avatarPreset)) {
      throw AppError.badRequest("Scene or avatar preset naming is misleading for synthetic UGC flows");
    }

    if (!payload.brandSafeMode) {
      warnings.push("brandSafeMode disabled. Hard policy checks stay enforced.");
    }

    return {
      appliedChecks,
      warnings
    };
  }

  enforceOutputPolicy(
    result: Omit<UGCGenerationResultPayload, "safetyMetadata" | "disclosureFlags">
  ): BrandSafeOutputAssessment {
    const blockedClaims: string[] = [];
    const warnings: string[] = [];

    const filteredVariants = result.creativeVariants.filter((variant) => {
      const keepVariant =
        shouldKeepText(variant.title, blockedClaims) &&
        shouldKeepText(variant.concept, blockedClaims) &&
        shouldKeepText(variant.sceneDirection, blockedClaims) &&
        shouldKeepText(variant.avatarDirection, blockedClaims);

      return keepVariant;
    });

    const hookSuggestions = result.hookSuggestions.filter((hook) => shouldKeepText(hook, blockedClaims));
    const shortCopySuggestions = result.shortCopySuggestions.filter((copy) => shouldKeepText(copy, blockedClaims));
    const ctaSuggestions = result.ctaSuggestions.filter((cta) => shouldKeepText(cta, blockedClaims));

    const fallbackVariant: UGCCreativeVariant = {
      id: "brand-safe-fallback",
      category: "lifestyle_concepts",
      title: "Brand-safe fallback concept",
      concept: "Synthetic lifestyle ad creative with neutral product focus.",
      sceneDirection: "Clean product-focused scene with controlled lighting.",
      avatarDirection: "No personal claims. Presenter optional for product demonstration.",
      formatRecommendations: result.placementFormats,
      imageResultReference: "placeholder://brand-safe-fallback",
      disclosureRequired: true
    };

    const safeVariants = filteredVariants.length > 0 ? filteredVariants : [fallbackVariant];

    if (hookSuggestions.length === 0) {
      warnings.push("All hook suggestions were filtered by policy checks.");
    }

    if (shortCopySuggestions.length === 0) {
      warnings.push("All short copy suggestions were filtered by policy checks.");
    }

    return {
      filteredResult: {
        ...result,
        creativeVariants: safeVariants,
        imageResultReferences: result.imageResultReferences.filter((reference) =>
          safeVariants.some((variant) => variant.id === reference.variantId)
        ),
        hookSuggestions,
        shortCopySuggestions,
        ctaSuggestions
      },
      blockedClaims: Array.from(new Set(blockedClaims)),
      warnings
    };
  }

  getDisclosureLabel(enabled: boolean): string {
    return enabled ? DEFAULT_DISCLOSURE_LABEL : "Disclosure disabled by request.";
  }
}
