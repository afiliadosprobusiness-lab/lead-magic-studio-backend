import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import {
  mapObjectiveFromPrisma,
  mapObjectiveToPrisma,
  mapPlatformFromPrisma,
  mapPlatformToPrisma,
  mapToneFromPrisma,
  mapToneToPrisma
} from "../copy-generator/copy-generator.types";
import type {
  CopyTemplateDto,
  CreateCopyTemplateDto,
  ListCopyTemplatesQueryDto,
  UpdateCopyTemplateDto
} from "./templates.types";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function fromJsonObject(value: Prisma.JsonValue | null): Record<string, unknown> | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function mapTemplate(record: Prisma.CopyTemplateGetPayload<Record<string, never>>): CopyTemplateDto {
  return {
    id: record.id,
    ownerId: record.ownerId,
    projectId: record.projectId,
    name: record.name,
    description: record.description,
    objective: record.objective ? mapObjectiveFromPrisma(record.objective) : null,
    tone: record.tone ? mapToneFromPrisma(record.tone) : null,
    platform: record.platform ? mapPlatformFromPrisma(record.platform) : null,
    language: record.language,
    isSystem: record.isSystem,
    isPreset: record.isPreset,
    templateText: record.templateText,
    ctaDefault: record.ctaDefault,
    metadata: fromJsonObject(record.metadata),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

export class TemplatesRepository {
  async list(ownerId: string, query: ListCopyTemplatesQueryDto): Promise<CopyTemplateDto[]> {
    const filters: Prisma.CopyTemplateWhereInput[] = [
      {
        OR: query.includeSystem === false ? [{ ownerId }] : [{ ownerId }, { isSystem: true }]
      }
    ];

    if (query.projectId) {
      filters.push({
        OR: [{ projectId: query.projectId }, { projectId: null }]
      });
    }

    if (query.isPreset !== undefined) {
      filters.push({ isPreset: query.isPreset });
    }

    if (query.objective) {
      filters.push({ objective: mapObjectiveToPrisma(query.objective) });
    }

    if (query.tone) {
      filters.push({ tone: mapToneToPrisma(query.tone) });
    }

    if (query.platform) {
      filters.push({ platform: mapPlatformToPrisma(query.platform) });
    }

    const rows = await prisma.copyTemplate.findMany({
      where: {
        AND: filters
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map(mapTemplate);
  }

  async create(ownerId: string, payload: CreateCopyTemplateDto): Promise<CopyTemplateDto> {
    const created = await prisma.copyTemplate.create({
      data: {
        ownerId,
        projectId: payload.projectId,
        name: payload.name,
        description: payload.description,
        objective: payload.objective ? mapObjectiveToPrisma(payload.objective) : undefined,
        tone: payload.tone ? mapToneToPrisma(payload.tone) : undefined,
        platform: payload.platform ? mapPlatformToPrisma(payload.platform) : undefined,
        language: payload.language ?? "es",
        isSystem: payload.isSystem ?? false,
        isPreset: payload.isPreset ?? false,
        templateText: payload.templateText,
        ctaDefault: payload.ctaDefault,
        metadata: payload.metadata ? toJsonValue(payload.metadata) : undefined
      }
    });

    return mapTemplate(created);
  }

  async findById(ownerId: string, templateId: string): Promise<CopyTemplateDto | null> {
    const row = await prisma.copyTemplate.findFirst({
      where: {
        id: templateId,
        OR: [{ ownerId }, { isSystem: true }]
      }
    });

    if (!row) {
      return null;
    }

    return mapTemplate(row);
  }

  async update(ownerId: string, templateId: string, payload: UpdateCopyTemplateDto): Promise<CopyTemplateDto | null> {
    const existing = await prisma.copyTemplate.findFirst({
      where: {
        id: templateId,
        ownerId
      }
    });

    if (!existing) {
      return null;
    }

    const updated = await prisma.copyTemplate.update({
      where: { id: templateId },
      data: {
        projectId: payload.projectId === undefined ? undefined : payload.projectId,
        name: payload.name,
        description: payload.description === undefined ? undefined : payload.description,
        objective:
          payload.objective === undefined
            ? undefined
            : payload.objective === null
              ? null
              : mapObjectiveToPrisma(payload.objective),
        tone: payload.tone === undefined ? undefined : payload.tone === null ? null : mapToneToPrisma(payload.tone),
        platform:
          payload.platform === undefined
            ? undefined
            : payload.platform === null
              ? null
              : mapPlatformToPrisma(payload.platform),
        language: payload.language,
        isPreset: payload.isPreset,
        templateText: payload.templateText,
        ctaDefault: payload.ctaDefault === undefined ? undefined : payload.ctaDefault,
        metadata:
          payload.metadata === undefined
            ? undefined
            : payload.metadata === null
              ? Prisma.JsonNull
              : toJsonValue(payload.metadata)
      }
    });

    return mapTemplate(updated);
  }

  async delete(ownerId: string, templateId: string): Promise<boolean> {
    const existing = await prisma.copyTemplate.findFirst({
      where: {
        id: templateId,
        ownerId
      }
    });

    if (!existing) {
      return false;
    }

    await prisma.copyTemplate.delete({ where: { id: templateId } });
    return true;
  }
}
