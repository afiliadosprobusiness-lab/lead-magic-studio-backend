import type { PublisherPlatform } from "../copy-generator/copy-generator.types";
import type { AssetReferenceInputDto } from "../asset-library/asset-library.types";

export const PUBLICATION_DRAFT_STATUSES = ["draft", "ready"] as const;

export type PublicationDraftStatus = (typeof PUBLICATION_DRAFT_STATUSES)[number];

export type PublicationDraftDto = {
  id: string;
  projectId: string;
  ownerId: string;
  platform: PublisherPlatform;
  selectedCopyId: string | null;
  creativePackId: string | null;
  selectedAssetRefs: AssetReferenceInputDto[];
  captionText: string;
  finalText: string | null;
  ctaText: string | null;
  finalUrl: string | null;
  status: PublicationDraftStatus;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePublicationDraftDto = {
  platform: PublisherPlatform;
  selectedCopyId?: string;
  creativePackId?: string;
  selectedAssetRefs?: AssetReferenceInputDto[];
  captionText: string;
  finalText?: string;
  ctaText?: string;
  finalUrl?: string;
  status?: PublicationDraftStatus;
  scheduledAt?: Date;
};

export type UpdatePublicationDraftDto = {
  platform?: PublisherPlatform;
  selectedCopyId?: string | null;
  creativePackId?: string | null;
  selectedAssetRefs?: AssetReferenceInputDto[];
  captionText?: string;
  finalText?: string | null;
  ctaText?: string | null;
  finalUrl?: string | null;
  status?: PublicationDraftStatus;
  scheduledAt?: Date | null;
};
