import type { ProjectHistoryEventType } from "@prisma/client";

export type ProjectHistoryEventDto = {
  id: string;
  projectId: string;
  ownerId: string;
  eventType: ProjectHistoryEventType;
  entityType: string;
  entityId: string;
  summary: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
};

export type RecordProjectHistoryEventDto = {
  projectId: string;
  ownerId: string;
  eventType: ProjectHistoryEventType;
  entityType: string;
  entityId: string;
  summary: string;
  payload?: Record<string, unknown>;
};
