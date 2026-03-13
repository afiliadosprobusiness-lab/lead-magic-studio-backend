import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { ProjectHistoryEventDto, RecordProjectHistoryEventDto } from "./project-history.types";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function fromJsonObject(value: Prisma.JsonValue | null): Record<string, unknown> | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  return value as Record<string, unknown>;
}

export class ProjectHistoryRepository {
  async create(input: RecordProjectHistoryEventDto): Promise<ProjectHistoryEventDto> {
    const created = await prisma.projectHistoryEvent.create({
      data: {
        projectId: input.projectId,
        ownerId: input.ownerId,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        summary: input.summary,
        payload: input.payload ? toJsonValue(input.payload) : undefined
      }
    });

    return {
      id: created.id,
      projectId: created.projectId,
      ownerId: created.ownerId,
      eventType: created.eventType,
      entityType: created.entityType,
      entityId: created.entityId,
      summary: created.summary,
      payload: fromJsonObject(created.payload),
      createdAt: created.createdAt
    };
  }

  async listByProject(ownerId: string, projectId: string, limit: number): Promise<ProjectHistoryEventDto[]> {
    const rows = await prisma.projectHistoryEvent.findMany({
      where: {
        ownerId,
        projectId
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return rows.map((row) => ({
      id: row.id,
      projectId: row.projectId,
      ownerId: row.ownerId,
      eventType: row.eventType,
      entityType: row.entityType,
      entityId: row.entityId,
      summary: row.summary,
      payload: fromJsonObject(row.payload),
      createdAt: row.createdAt
    }));
  }
}
