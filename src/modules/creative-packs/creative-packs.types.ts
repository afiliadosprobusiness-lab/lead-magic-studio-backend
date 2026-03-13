import type { CopyObjective, CopyTone, PublisherPlatform } from "../copy-generator/copy-generator.types";
import type { AssetReferenceInputDto } from "../asset-library/asset-library.types";

export type CreativePackItemDto = {
  id: string;
  assetType: AssetReferenceInputDto["type"];
  assetId: string;
  label: string | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};

export type CreativePackDto = {
  id: string;
  projectId: string;
  ownerId: string;
  name: string;
  objective: CopyObjective | null;
  tone: CopyTone | null;
  platform: PublisherPlatform | null;
  notes: string | null;
  createdFromCopyId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: CreativePackItemDto[];
};

export type CreateCreativePackDto = {
  name: string;
  objective?: CopyObjective;
  tone?: CopyTone;
  platform?: PublisherPlatform;
  notes?: string;
  createdFromCopyId?: string;
  assets?: AssetReferenceInputDto[];
};
