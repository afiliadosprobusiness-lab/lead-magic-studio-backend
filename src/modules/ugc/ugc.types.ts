export const UGC_CREATIVE_TYPES = [
  "lifestyle_concepts",
  "creator_style_ad_concepts",
  "social_post_variants"
] as const;

export const UGC_TARGET_PLATFORMS = ["instagram", "tiktok", "facebook", "youtube_shorts"] as const;

export const UGC_OUTPUT_FORMATS = ["square_1_1", "vertical_9_16", "portrait_4_5", "landscape_16_9"] as const;

export const UGC_CONTENT_POLICY_CHECKS = [
  "creativeTypeAllowlist",
  "prohibitedClaims",
  "misleadingNaming",
  "disclosureCompliance",
  "outputModeration"
] as const;

export type UGCCreativeType = (typeof UGC_CREATIVE_TYPES)[number];
export type UGCTargetPlatform = (typeof UGC_TARGET_PLATFORMS)[number];
export type UGCOutputFormat = (typeof UGC_OUTPUT_FORMATS)[number];
export type UGCContentPolicyCheck = (typeof UGC_CONTENT_POLICY_CHECKS)[number];

export type GenerateUGCDto = {
  projectId: string;
  productImageIds: string[];
  creativeType: UGCCreativeType;
  targetPlatform: UGCTargetPlatform;
  scenePreset: string;
  avatarPreset: string;
  toneStyle: string;
  customPrompt?: string;
  outputFormats: UGCOutputFormat[];
  brandSafeMode: boolean;
  disclosureEnabled: boolean;
  contentPolicyChecks?: UGCContentPolicyCheck[];
};

export type UGCImageReference = {
  variantId: string;
  reference: string | null;
  status: "placeholder" | "generated";
};

export type UGCCreativeVariant = {
  id: string;
  category: "lifestyle_concepts" | "creator_style_ad_concepts" | "social_post_variants";
  title: string;
  concept: string;
  sceneDirection: string;
  avatarDirection: string;
  formatRecommendations: UGCOutputFormat[];
  imageResultReference: string | null;
  disclosureRequired: boolean;
};

export type UGCDisclosureFlags = {
  enabled: boolean;
  label: string;
  requiredByBrandSafe: boolean;
};

export type UGCSafetyMetadata = {
  brandSafeMode: boolean;
  appliedChecks: UGCContentPolicyCheck[];
  blockedClaimCount: number;
  filteredClaims: string[];
  warnings: string[];
};

export type UGCGenerationResultPayload = {
  creativeVariants: UGCCreativeVariant[];
  imageResultReferences: UGCImageReference[];
  hookSuggestions: string[];
  shortCopySuggestions: string[];
  ctaSuggestions: string[];
  placementFormats: UGCOutputFormat[];
  disclosureFlags: UGCDisclosureFlags;
  safetyMetadata: UGCSafetyMetadata;
};

export type UGCGenerationJobDto = {
  id: string;
  projectId: string;
  status: string;
  progress: number;
  creativeType: UGCCreativeType;
  targetPlatform: UGCTargetPlatform;
  scenePreset: string;
  avatarPreset: string;
  toneStyle: string;
  outputFormats: UGCOutputFormat[];
  brandSafeMode: boolean;
  disclosureEnabled: boolean;
  contentPolicyChecks: UGCContentPolicyCheck[];
  productImageIds: string[];
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UGCJobResultsDto = {
  jobId: string;
  projectId: string;
  status: string;
  result: UGCGenerationResultPayload | null;
};
