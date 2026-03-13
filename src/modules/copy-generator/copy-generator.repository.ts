import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type {
  CopyGenerationVariant,
  CopyObjective,
  CopyTone,
  DuplicateGeneratedCopyDto,
  GeneratedCopyDto,
  PublisherPlatform,
  UpdateGeneratedCopyDto
} from "./copy-generator.types";
import {
  mapObjectiveFromPrisma,
  mapObjectiveToPrisma,
  mapPlatformFromPrisma,
  mapPlatformToPrisma,
  mapToneFromPrisma,
  mapToneToPrisma
} from "./copy-generator.types";

type GeneratedCopyRecord = Prisma.GeneratedCopyGetPayload<Record<string, never>>;

type CopyTemplateSourceRecord = Prisma.CopyTemplateGetPayload<Record<string, never>>;

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function fromJsonStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item));
}

function mapGeneratedCopy(record: GeneratedCopyRecord): GeneratedCopyDto {
  return {
    id: record.id,
    projectId: record.projectId,
    sourceTemplateId: record.sourceTemplateId,
    sourceGenerationJobId: record.sourceGenerationJobId,
    objective: mapObjectiveFromPrisma(record.objective),
    tone: mapToneFromPrisma(record.tone),
    platform: record.platform ? mapPlatformFromPrisma(record.platform) : null,
    language: record.language,
    label: record.label,
    headline: record.headline,
    primaryText: record.primaryText,
    cta: record.cta,
    shortCaption: record.shortCaption,
    hookVariants: fromJsonStringArray(record.hookVariants),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

export class CopyGeneratorRepository {
  async createMany(input: {
    ownerId: string;
    projectId: string;
    sourceTemplateId?: string;
    sourceGenerationJobId?: string;
    objective: CopyObjective;
    tone: CopyTone;
    platform?: PublisherPlatform;
    language: string;
    variants: CopyGenerationVariant[];
  }): Promise<GeneratedCopyDto[]> {
    const rows = await prisma.$transaction(
      input.variants.map((variant) =>
        prisma.generatedCopy.create({
          data: {
            ownerId: input.ownerId,
            projectId: input.projectId,
            sourceTemplateId: input.sourceTemplateId,
            sourceGenerationJobId: input.sourceGenerationJobId,
            objective: mapObjectiveToPrisma(input.objective),
            tone: mapToneToPrisma(input.tone),
            platform: input.platform ? mapPlatformToPrisma(input.platform) : undefined,
            language: input.language,
            label: variant.label,
            headline: variant.headline,
            primaryText: variant.primaryText,
            cta: variant.cta,
            shortCaption: variant.shortCaption,
            hookVariants: toJsonValue(variant.hookVariants),
            rawProviderResponse: variant.rawProviderResponse ? toJsonValue(variant.rawProviderResponse) : undefined
          }
        })
      )
    );

    return rows.map(mapGeneratedCopy);
  }

  async listByProject(ownerId: string, projectId: string): Promise<GeneratedCopyDto[]> {
    const rows = await prisma.generatedCopy.findMany({
      where: {
        ownerId,
        projectId
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map(mapGeneratedCopy);
  }

  async findById(ownerId: string, copyId: string): Promise<GeneratedCopyDto | null> {
    const row = await prisma.generatedCopy.findFirst({
      where: {
        id: copyId,
        ownerId
      }
    });

    if (!row) {
      return null;
    }

    return mapGeneratedCopy(row);
  }

  async findByIdForProject(ownerId: string, projectId: string, copyId: string): Promise<GeneratedCopyDto | null> {
    const row = await prisma.generatedCopy.findFirst({
      where: {
        id: copyId,
        ownerId,
        projectId
      }
    });

    if (!row) {
      return null;
    }

    return mapGeneratedCopy(row);
  }

  async update(ownerId: string, copyId: string, payload: UpdateGeneratedCopyDto): Promise<GeneratedCopyDto | null> {
    const existing = await prisma.generatedCopy.findFirst({
      where: {
        id: copyId,
        ownerId
      }
    });

    if (!existing) {
      return null;
    }

    const updated = await prisma.generatedCopy.update({
      where: { id: copyId },
      data: {
        objective: payload.objective ? mapObjectiveToPrisma(payload.objective) : undefined,
        tone: payload.tone ? mapToneToPrisma(payload.tone) : undefined,
        platform:
          payload.platform === undefined
            ? undefined
            : payload.platform === null
              ? null
              : mapPlatformToPrisma(payload.platform),
        language: payload.language,
        label: payload.label === undefined ? undefined : payload.label,
        headline: payload.headline,
        primaryText: payload.primaryText,
        cta: payload.cta,
        shortCaption: payload.shortCaption,
        hookVariants: payload.hookVariants ? toJsonValue(payload.hookVariants) : undefined
      }
    });

    return mapGeneratedCopy(updated);
  }

  async delete(ownerId: string, copyId: string): Promise<boolean> {
    const existing = await prisma.generatedCopy.findFirst({
      where: {
        id: copyId,
        ownerId
      },
      select: { id: true }
    });

    if (!existing) {
      return false;
    }

    await prisma.generatedCopy.delete({ where: { id: copyId } });
    return true;
  }

  async duplicate(ownerId: string, copyId: string, payload: DuplicateGeneratedCopyDto): Promise<GeneratedCopyDto | null> {
    const source = await prisma.generatedCopy.findFirst({
      where: {
        id: copyId,
        ownerId
      }
    });

    if (!source) {
      return null;
    }

    const duplicated = await prisma.generatedCopy.create({
      data: {
        ownerId: source.ownerId,
        projectId: source.projectId,
        sourceTemplateId: source.sourceTemplateId,
        sourceGenerationJobId: source.sourceGenerationJobId,
        objective: source.objective,
        tone: source.tone,
        platform: source.platform,
        language: source.language,
        label: payload.label?.trim() || source.label || "Copy duplicado",
        headline: source.headline,
        primaryText: source.primaryText,
        cta: source.cta,
        shortCaption: source.shortCaption,
        hookVariants: toJsonValue(source.hookVariants),
        rawProviderResponse:
          source.rawProviderResponse === null ? Prisma.JsonNull : toJsonValue(source.rawProviderResponse)
      }
    });

    return mapGeneratedCopy(duplicated);
  }

  async findTemplateById(ownerId: string, templateId: string): Promise<CopyTemplateSourceRecord | null> {
    return prisma.copyTemplate.findFirst({
      where: {
        id: templateId,
        OR: [{ ownerId }, { isSystem: true }]
      }
    });
  }
}
