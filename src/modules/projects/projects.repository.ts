import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { CreateProjectDto, ProjectDetailDto, ProjectSummaryDto } from "./projects.types";

type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    projectInput: true;
    generationJobs: {
      orderBy: { createdAt: "desc" };
      take: 1;
    };
  };
}>;

type ProjectWithInput = Prisma.ProjectGetPayload<{
  include: {
    projectInput: true;
  };
}>;

function toInputJson(value: Record<string, unknown> | undefined): Prisma.InputJsonValue | undefined {
  if (!value) {
    return undefined;
  }

  return value as Prisma.InputJsonValue;
}

function fromJsonArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item));
}

function fromJsonObject(value: Prisma.JsonValue | null): Record<string, unknown> | undefined {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return undefined;
  }

  return value as Record<string, unknown>;
}

function mapProjectToDetail(project: ProjectWithInput): ProjectDetailDto {
  return {
    id: project.id,
    name: project.name,
    status: project.status,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    input: project.projectInput
      ? {
          offerName: project.projectInput.offerName,
          offerDescription: project.projectInput.offerDescription,
          targetAudience: project.projectInput.targetAudience,
          painPoints: fromJsonArray(project.projectInput.painPoints),
          benefits: fromJsonArray(project.projectInput.benefits),
          uniqueValueProposition: project.projectInput.uniqueValueProposition,
          tone: project.projectInput.tone,
          callToAction: project.projectInput.callToAction,
          language: project.projectInput.language,
          rawWizardData: fromJsonObject(project.projectInput.rawWizardData)
        }
      : null
  };
}

export class ProjectsRepository {
  async create(ownerId: string, payload: CreateProjectDto): Promise<ProjectDetailDto> {
    const createdProject = await prisma.project.create({
      data: {
        ownerId,
        name: payload.name,
        status: "DRAFT",
        projectInput: {
          create: {
            offerName: payload.input.offerName,
            offerDescription: payload.input.offerDescription,
            targetAudience: payload.input.targetAudience,
            painPoints: payload.input.painPoints,
            benefits: payload.input.benefits,
            uniqueValueProposition: payload.input.uniqueValueProposition,
            tone: payload.input.tone,
            callToAction: payload.input.callToAction,
            language: payload.input.language,
            rawWizardData: toInputJson(payload.input.rawWizardData)
          }
        }
      },
      include: {
        projectInput: true
      }
    });

    return mapProjectToDetail(createdProject);
  }

  async list(ownerId: string): Promise<ProjectSummaryDto[]> {
    const rows = await prisma.project.findMany({
      where: { ownerId },
      include: {
        generationJobs: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      latestGenerationStatus: project.generationJobs[0]?.status ?? null
    }));
  }

  async findById(projectId: string, ownerId: string): Promise<ProjectDetailDto | null> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId
      },
      include: {
        projectInput: true
      }
    });

    if (!project) {
      return null;
    }

    return mapProjectToDetail(project);
  }

  async findRecordById(projectId: string, ownerId: string): Promise<ProjectWithRelations | null> {
    return prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId
      },
      include: {
        projectInput: true,
        generationJobs: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });
  }

  async updateStatus(projectId: string, status: ProjectDetailDto["status"]): Promise<void> {
    await prisma.project.update({
      where: { id: projectId },
      data: { status }
    });
  }

  async createDuplicate(ownerId: string, sourceProjectId: string, name: string): Promise<ProjectDetailDto | null> {
    return prisma.$transaction(async (tx) => {
      const sourceProject = await tx.project.findFirst({
        where: { id: sourceProjectId, ownerId },
        include: { projectInput: true }
      });

      if (!sourceProject || !sourceProject.projectInput) {
        return null;
      }

      const duplicatedProject = await tx.project.create({
        data: {
          ownerId,
          name,
          status: "DRAFT",
          projectInput: {
            create: {
              offerName: sourceProject.projectInput.offerName,
              offerDescription: sourceProject.projectInput.offerDescription,
              targetAudience: sourceProject.projectInput.targetAudience,
              painPoints: sourceProject.projectInput.painPoints as Prisma.InputJsonValue,
              benefits: sourceProject.projectInput.benefits as Prisma.InputJsonValue,
              uniqueValueProposition: sourceProject.projectInput.uniqueValueProposition,
              tone: sourceProject.projectInput.tone,
              callToAction: sourceProject.projectInput.callToAction,
              language: sourceProject.projectInput.language,
              rawWizardData:
                sourceProject.projectInput.rawWizardData === null
                  ? Prisma.JsonNull
                  : (sourceProject.projectInput.rawWizardData as Prisma.InputJsonValue)
            }
          }
        },
        include: {
          projectInput: true
        }
      });

      return mapProjectToDetail(duplicatedProject);
    });
  }
}
