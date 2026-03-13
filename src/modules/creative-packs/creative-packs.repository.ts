import { CreativePackItemType, Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import {
  mapObjectiveFromPrisma,
  mapObjectiveToPrisma,
  mapPlatformFromPrisma,
  mapPlatformToPrisma,
  mapToneFromPrisma,
  mapToneToPrisma,
  type CopyObjective,
  type CopyTone,
  type PublisherPlatform
} from "../copy-generator/copy-generator.types";
import type { AssetReferenceInputDto } from "../asset-library/asset-library.types";
import type { CreativePackDto } from "./creative-packs.types";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function fromJsonObject(value: Prisma.JsonValue | null): Record<string, unknown> | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function toPrismaAssetType(type: AssetReferenceInputDto["type"]): CreativePackItemType {
  switch (type) {
    case "landing_mockup":
      return "LANDING_MOCKUP";
    case "copy_mockup":
      return "COPY_MOCKUP";
    case "creative_mockup":
      return "CREATIVE_MOCKUP";
    case "ugc_result":
      return "UGC_RESULT";
    case "generated_copy":
      return "GENERATED_COPY";
    default:
      throw new Error(`Unsupported asset type: ${String(type)}`);
  }
}

function fromPrismaAssetType(type: CreativePackItemType): AssetReferenceInputDto["type"] {
  switch (type) {
    case "LANDING_MOCKUP":
      return "landing_mockup";
    case "COPY_MOCKUP":
      return "copy_mockup";
    case "CREATIVE_MOCKUP":
      return "creative_mockup";
    case "UGC_RESULT":
      return "ugc_result";
    case "GENERATED_COPY":
      return "generated_copy";
    default:
      throw new Error(`Unsupported prisma asset type: ${String(type)}`);
  }
}

function mapCreativePack(
  row: Prisma.CreativePackGetPayload<{
    include: {
      items: true;
    };
  }>
): CreativePackDto {
  return {
    id: row.id,
    projectId: row.projectId,
    ownerId: row.ownerId,
    name: row.name,
    objective: row.objective ? mapObjectiveFromPrisma(row.objective) : null,
    tone: row.tone ? mapToneFromPrisma(row.tone) : null,
    platform: row.platform ? mapPlatformFromPrisma(row.platform) : null,
    notes: row.notes,
    createdFromCopyId: row.createdFromCopyId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: row.items.map((item) => ({
      id: item.id,
      assetType: fromPrismaAssetType(item.assetType),
      assetId: item.assetId,
      label: item.label,
      metadata: fromJsonObject(item.metadata),
      createdAt: item.createdAt
    }))
  };
}

export class CreativePacksRepository {
  async createPack(input: {
    ownerId: string;
    projectId: string;
    name: string;
    objective?: CopyObjective;
    tone?: CopyTone;
    platform?: PublisherPlatform;
    notes?: string;
    createdFromCopyId?: string;
    assets: AssetReferenceInputDto[];
  }): Promise<CreativePackDto> {
    const created = await prisma.creativePack.create({
      data: {
        ownerId: input.ownerId,
        projectId: input.projectId,
        name: input.name,
        objective: input.objective ? mapObjectiveToPrisma(input.objective) : undefined,
        tone: input.tone ? mapToneToPrisma(input.tone) : undefined,
        platform: input.platform ? mapPlatformToPrisma(input.platform) : undefined,
        notes: input.notes,
        createdFromCopyId: input.createdFromCopyId,
        items: {
          create: input.assets.map((asset) => ({
            assetType: toPrismaAssetType(asset.type),
            assetId: asset.id,
            generatedCopyId: asset.type === "generated_copy" ? asset.id : undefined,
            label: asset.label,
            metadata: asset.label ? toJsonValue({ label: asset.label }) : undefined
          }))
        }
      },
      include: {
        items: true
      }
    });

    return mapCreativePack(created);
  }

  async findById(ownerId: string, creativePackId: string): Promise<CreativePackDto | null> {
    const row = await prisma.creativePack.findFirst({
      where: {
        id: creativePackId,
        ownerId
      },
      include: {
        items: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!row) {
      return null;
    }

    return mapCreativePack(row);
  }

  async listByProject(ownerId: string, projectId: string): Promise<CreativePackDto[]> {
    const rows = await prisma.creativePack.findMany({
      where: {
        ownerId,
        projectId
      },
      include: {
        items: {
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map(mapCreativePack);
  }

  async existsByProject(ownerId: string, projectId: string, creativePackId: string): Promise<boolean> {
    const row = await prisma.creativePack.findFirst({
      where: {
        id: creativePackId,
        ownerId,
        projectId
      },
      select: { id: true }
    });

    return Boolean(row);
  }
}
