import type { CopyObjective, CopyTone, PublisherPlatform } from "../copy-generator/copy-generator.types";

export const ASSET_REFERENCE_TYPES = [
  "landing_mockup",
  "copy_mockup",
  "creative_mockup",
  "ugc_result",
  "generated_copy"
] as const;

export type AssetReferenceType = (typeof ASSET_REFERENCE_TYPES)[number];

export type AssetReferenceInputDto = {
  type: AssetReferenceType;
  id: string;
  label?: string;
};

export type AssetLibraryResponseDto = {
  projectId: string;
  assets: {
    landingMockups: Array<{
      id: string;
      generationJobId: string;
      headline: string;
      createdAt: Date;
    }>;
    copyMockups: Array<{
      id: string;
      generationJobId: string;
      adHeadline: string;
      createdAt: Date;
    }>;
    creativeMockups: Array<{
      id: string;
      generationJobId: string;
      conceptCount: number;
      createdAt: Date;
    }>;
    ugcResults: Array<{
      id: string;
      generationJobId: string;
      creativeVariantCount: number;
      createdAt: Date;
    }>;
    generatedCopies: Array<{
      id: string;
      objective: CopyObjective;
      tone: CopyTone;
      platform: PublisherPlatform | null;
      headline: string;
      createdAt: Date;
    }>;
    creativePacks: Array<{
      id: string;
      name: string;
      itemCount: number;
      createdAt: Date;
    }>;
  };
};
