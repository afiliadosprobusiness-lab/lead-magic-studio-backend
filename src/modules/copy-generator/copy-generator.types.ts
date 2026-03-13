import {
  CopyObjective as PrismaCopyObjective,
  CopyTone as PrismaCopyTone,
  PublisherPlatform as PrismaPublisherPlatform
} from "@prisma/client";

import type { ProjectInputDto } from "../projects/projects.types";

export const COPY_OBJECTIVES = ["venta_directa", "awareness", "remarketing", "lanzamiento", "oferta_urgencia"] as const;
export const COPY_TONES = ["agresivo", "premium", "emocional", "directo", "minimalista"] as const;
export const PUBLISHER_PLATFORMS = ["instagram", "facebook", "tiktok", "google"] as const;

export type CopyObjective = (typeof COPY_OBJECTIVES)[number];
export type CopyTone = (typeof COPY_TONES)[number];
export type PublisherPlatform = (typeof PUBLISHER_PLATFORMS)[number];

const OBJECTIVE_TO_PRISMA: Record<CopyObjective, PrismaCopyObjective> = {
  venta_directa: "DIRECT_SALE",
  awareness: "AWARENESS",
  remarketing: "REMARKETING",
  lanzamiento: "LAUNCH",
  oferta_urgencia: "URGENCY_OFFER"
};

const TONE_TO_PRISMA: Record<CopyTone, PrismaCopyTone> = {
  agresivo: "AGGRESSIVE",
  premium: "PREMIUM",
  emocional: "EMOTIONAL",
  directo: "DIRECT",
  minimalista: "MINIMALIST"
};

const PLATFORM_TO_PRISMA: Record<PublisherPlatform, PrismaPublisherPlatform> = {
  instagram: "INSTAGRAM",
  facebook: "FACEBOOK",
  tiktok: "TIKTOK",
  google: "GOOGLE"
};

const OBJECTIVE_FROM_PRISMA: Record<PrismaCopyObjective, CopyObjective> = {
  DIRECT_SALE: "venta_directa",
  AWARENESS: "awareness",
  REMARKETING: "remarketing",
  LAUNCH: "lanzamiento",
  URGENCY_OFFER: "oferta_urgencia"
};

const TONE_FROM_PRISMA: Record<PrismaCopyTone, CopyTone> = {
  AGGRESSIVE: "agresivo",
  PREMIUM: "premium",
  EMOTIONAL: "emocional",
  DIRECT: "directo",
  MINIMALIST: "minimalista"
};

const PLATFORM_FROM_PRISMA: Record<PrismaPublisherPlatform, PublisherPlatform> = {
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  TIKTOK: "tiktok",
  GOOGLE: "google"
};

export function mapObjectiveToPrisma(value: CopyObjective): PrismaCopyObjective {
  return OBJECTIVE_TO_PRISMA[value];
}

export function mapToneToPrisma(value: CopyTone): PrismaCopyTone {
  return TONE_TO_PRISMA[value];
}

export function mapPlatformToPrisma(value: PublisherPlatform): PrismaPublisherPlatform {
  return PLATFORM_TO_PRISMA[value];
}

export function mapObjectiveFromPrisma(value: PrismaCopyObjective): CopyObjective {
  return OBJECTIVE_FROM_PRISMA[value];
}

export function mapToneFromPrisma(value: PrismaCopyTone): CopyTone {
  return TONE_FROM_PRISMA[value];
}

export function mapPlatformFromPrisma(value: PrismaPublisherPlatform): PublisherPlatform {
  return PLATFORM_FROM_PRISMA[value];
}

export type GeneratedCopyDto = {
  id: string;
  projectId: string;
  sourceTemplateId: string | null;
  sourceGenerationJobId: string | null;
  objective: CopyObjective;
  tone: CopyTone;
  platform: PublisherPlatform | null;
  language: string;
  label: string | null;
  headline: string;
  primaryText: string;
  cta: string;
  shortCaption: string;
  hookVariants: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type CopyGenerationVariant = {
  label?: string;
  headline: string;
  primaryText: string;
  cta: string;
  shortCaption: string;
  hookVariants: string[];
  rawProviderResponse?: Record<string, unknown>;
};

export type GenerateProjectCopiesDto = {
  objective: CopyObjective;
  tone: CopyTone;
  platform?: PublisherPlatform;
  language?: string;
  templateId?: string;
  variants?: number;
};

export type UpdateGeneratedCopyDto = {
  objective?: CopyObjective;
  tone?: CopyTone;
  platform?: PublisherPlatform | null;
  language?: string;
  label?: string | null;
  headline?: string;
  primaryText?: string;
  cta?: string;
  shortCaption?: string;
  hookVariants?: string[];
};

export type DuplicateGeneratedCopyDto = {
  label?: string;
};

export type CopyGenerationContext = {
  projectId: string;
  projectName: string;
  input: ProjectInputDto;
  objective: CopyObjective;
  tone: CopyTone;
  platform?: PublisherPlatform;
  language: string;
  templateName?: string;
  templateText?: string;
  ctaDefault?: string;
  variants: number;
};
