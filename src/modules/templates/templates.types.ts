import type { CopyObjective, CopyTone, PublisherPlatform } from "../copy-generator/copy-generator.types";

export type CopyTemplateDto = {
  id: string;
  ownerId: string;
  projectId: string | null;
  name: string;
  description: string | null;
  objective: CopyObjective | null;
  tone: CopyTone | null;
  platform: PublisherPlatform | null;
  language: string;
  isSystem: boolean;
  isPreset: boolean;
  templateText: string;
  ctaDefault: string | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCopyTemplateDto = {
  projectId?: string;
  name: string;
  description?: string;
  objective?: CopyObjective;
  tone?: CopyTone;
  platform?: PublisherPlatform;
  language?: string;
  isSystem?: boolean;
  isPreset?: boolean;
  templateText: string;
  ctaDefault?: string;
  metadata?: Record<string, unknown>;
};

export type UpdateCopyTemplateDto = {
  projectId?: string | null;
  name?: string;
  description?: string | null;
  objective?: CopyObjective | null;
  tone?: CopyTone | null;
  platform?: PublisherPlatform | null;
  language?: string;
  isPreset?: boolean;
  templateText?: string;
  ctaDefault?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ListCopyTemplatesQueryDto = {
  includeSystem?: boolean;
  isPreset?: boolean;
  objective?: CopyObjective;
  tone?: CopyTone;
  platform?: PublisherPlatform;
  projectId?: string;
};
