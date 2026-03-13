import { Prisma, PublicationDraftStatus as PrismaPublicationDraftStatus } from "@prisma/client";

import { prisma } from "../../database/prisma";
import {
  mapPlatformFromPrisma,
  mapPlatformToPrisma,
  type PublisherPlatform
} from "../copy-generator/copy-generator.types";
import type { AssetReferenceInputDto } from "../asset-library/asset-library.types";
import type {
  CreatePublicationDraftDto,
  PublicationDraftDto,
  PublicationDraftStatus,
  UpdatePublicationDraftDto
} from "./publisher-drafts.types";

const STATUS_TO_PRISMA: Record<PublicationDraftStatus, PrismaPublicationDraftStatus> = {
  draft: "DRAFT",
  ready: "READY"
};

const STATUS_FROM_PRISMA: Record<PrismaPublicationDraftStatus, PublicationDraftStatus> = {
  DRAFT: "draft",
  READY: "ready"
};

function toPrismaStatus(status: PublicationDraftStatus): PrismaPublicationDraftStatus {
  return STATUS_TO_PRISMA[status];
}

function fromPrismaStatus(status: PrismaPublicationDraftStatus): PublicationDraftStatus {
  return STATUS_FROM_PRISMA[status];
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function fromJsonAssetRefs(value: Prisma.JsonValue): AssetReferenceInputDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object" && !Array.isArray(item))
    .map((item) => item as Record<string, unknown>)
    .filter((item) => typeof item.type === "string" && typeof item.id === "string")
    .map((item) => ({
      type: String(item.type) as AssetReferenceInputDto["type"],
      id: String(item.id),
      label: typeof item.label === "string" ? item.label : undefined
    }));
}

function mapDraft(row: Prisma.PublicationDraftGetPayload<Record<string, never>>): PublicationDraftDto {
  return {
    id: row.id,
    projectId: row.projectId,
    ownerId: row.ownerId,
    platform: mapPlatformFromPrisma(row.platform),
    selectedCopyId: row.selectedCopyId,
    creativePackId: row.creativePackId,
    selectedAssetRefs: fromJsonAssetRefs(row.selectedAssetRefs),
    captionText: row.captionText,
    finalText: row.finalText,
    ctaText: row.ctaText,
    finalUrl: row.finalUrl,
    status: fromPrismaStatus(row.status),
    scheduledAt: row.scheduledAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export class PublisherDraftsRepository {
  async create(ownerId: string, projectId: string, payload: CreatePublicationDraftDto): Promise<PublicationDraftDto> {
    const created = await prisma.publicationDraft.create({
      data: {
        ownerId,
        projectId,
        platform: mapPlatformToPrisma(payload.platform),
        selectedCopyId: payload.selectedCopyId,
        creativePackId: payload.creativePackId,
        selectedAssetRefs: toJsonValue(payload.selectedAssetRefs ?? []),
        captionText: payload.captionText,
        finalText: payload.finalText,
        ctaText: payload.ctaText,
        finalUrl: payload.finalUrl,
        status: toPrismaStatus(payload.status ?? "draft"),
        scheduledAt: payload.scheduledAt
      }
    });

    return mapDraft(created);
  }

  async listByProject(ownerId: string, projectId: string): Promise<PublicationDraftDto[]> {
    const rows = await prisma.publicationDraft.findMany({
      where: {
        ownerId,
        projectId
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map(mapDraft);
  }

  async findById(ownerId: string, draftId: string): Promise<PublicationDraftDto | null> {
    const row = await prisma.publicationDraft.findFirst({
      where: {
        id: draftId,
        ownerId
      }
    });

    if (!row) {
      return null;
    }

    return mapDraft(row);
  }

  async update(ownerId: string, draftId: string, payload: UpdatePublicationDraftDto): Promise<PublicationDraftDto | null> {
    const existing = await prisma.publicationDraft.findFirst({
      where: {
        id: draftId,
        ownerId
      },
      select: { id: true }
    });

    if (!existing) {
      return null;
    }

    const updated = await prisma.publicationDraft.update({
      where: { id: draftId },
      data: {
        platform: payload.platform ? mapPlatformToPrisma(payload.platform) : undefined,
        selectedCopyId:
          payload.selectedCopyId === undefined
            ? undefined
            : payload.selectedCopyId === null
              ? null
              : payload.selectedCopyId,
        creativePackId:
          payload.creativePackId === undefined
            ? undefined
            : payload.creativePackId === null
              ? null
              : payload.creativePackId,
        selectedAssetRefs: payload.selectedAssetRefs ? toJsonValue(payload.selectedAssetRefs) : undefined,
        captionText: payload.captionText,
        finalText: payload.finalText === undefined ? undefined : payload.finalText,
        ctaText: payload.ctaText === undefined ? undefined : payload.ctaText,
        finalUrl: payload.finalUrl === undefined ? undefined : payload.finalUrl,
        status: payload.status ? toPrismaStatus(payload.status) : undefined,
        scheduledAt: payload.scheduledAt === undefined ? undefined : payload.scheduledAt
      }
    });

    return mapDraft(updated);
  }

  async delete(ownerId: string, draftId: string): Promise<boolean> {
    const existing = await prisma.publicationDraft.findFirst({
      where: {
        id: draftId,
        ownerId
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return false;
    }

    await prisma.publicationDraft.delete({ where: { id: draftId } });
    return true;
  }

  async hasCreativePack(ownerId: string, projectId: string, creativePackId: string): Promise<boolean> {
    const row = await prisma.creativePack.findFirst({
      where: {
        id: creativePackId,
        ownerId,
        projectId
      },
      select: {
        id: true
      }
    });

    return Boolean(row);
  }

  async hasGeneratedCopy(ownerId: string, projectId: string, copyId: string): Promise<boolean> {
    const row = await prisma.generatedCopy.findFirst({
      where: {
        id: copyId,
        ownerId,
        projectId
      },
      select: {
        id: true
      }
    });

    return Boolean(row);
  }

  async hasProject(ownerId: string, projectId: string): Promise<boolean> {
    const row = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId
      },
      select: { id: true }
    });

    return Boolean(row);
  }

  async getProjectIdByDraft(ownerId: string, draftId: string): Promise<string | null> {
    const row = await prisma.publicationDraft.findFirst({
      where: {
        id: draftId,
        ownerId
      },
      select: {
        projectId: true
      }
    });

    return row?.projectId ?? null;
  }

  async listPlatformsByProject(ownerId: string, projectId: string): Promise<PublisherPlatform[]> {
    const rows = await prisma.publicationDraft.findMany({
      where: {
        ownerId,
        projectId
      },
      select: {
        platform: true
      },
      distinct: ["platform"]
    });

    return rows.map((row) => mapPlatformFromPrisma(row.platform));
  }
}
