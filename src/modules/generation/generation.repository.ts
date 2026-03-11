import type { GenerationJobStatus, GenerationStepStatus } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type { GenerationPart, GenerationResultPayload } from "./generation.types";

const STEP_MAP: Record<GenerationPart, { key: string; label: string; order: number }> = {
  landing: { key: "LANDING_MOCKUP", label: "Generate landing mockup", order: 1 },
  copy: { key: "COPY_MOCKUP", label: "Generate copy mockup", order: 2 },
  creatives: { key: "CREATIVES_MOCKUP", label: "Generate creatives mockup", order: 3 }
};

export class GenerationRepository {
  async createJob(projectId: string, parts: GenerationPart[]) {
    const steps = parts.map((part) => STEP_MAP[part]);

    return prisma.generationJob.create({
      data: {
        projectId,
        status: "QUEUED",
        requestedParts: parts,
        steps: {
          create: steps.map((step) => ({
            key: step.key,
            label: step.label,
            order: step.order,
            status: "PENDING"
          }))
        }
      },
      include: {
        steps: {
          orderBy: { order: "asc" }
        }
      }
    });
  }

  async updateJobStatus(jobId: string, status: GenerationJobStatus, errorMessage?: string): Promise<void> {
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status,
        startedAt: status === "PROCESSING" ? new Date() : undefined,
        completedAt: status === "COMPLETED" || status === "FAILED" ? new Date() : undefined,
        errorMessage: errorMessage ?? null
      }
    });
  }

  async updateStepStatus(jobId: string, key: string, status: GenerationStepStatus, errorMessage?: string): Promise<void> {
    await prisma.generationStep.update({
      where: {
        generationJobId_key: {
          generationJobId: jobId,
          key
        }
      },
      data: {
        status,
        startedAt: status === "RUNNING" ? new Date() : undefined,
        completedAt: status === "COMPLETED" || status === "FAILED" || status === "SKIPPED" ? new Date() : undefined,
        errorMessage: errorMessage ?? null
      }
    });
  }

  async saveResults(jobId: string, results: GenerationResultPayload): Promise<void> {
    await prisma.$transaction(async (tx) => {
      if (results.landing) {
        await tx.landingMockup.upsert({
          where: { generationJobId: jobId },
          create: {
            generationJobId: jobId,
            headline: results.landing.headline,
            subheadline: results.landing.subheadline,
            ctaText: results.landing.ctaText,
            sections: results.landing.sections,
            rawData: results.landing
          },
          update: {
            headline: results.landing.headline,
            subheadline: results.landing.subheadline,
            ctaText: results.landing.ctaText,
            sections: results.landing.sections,
            rawData: results.landing
          }
        });
      }

      if (results.copy) {
        await tx.copyMockup.upsert({
          where: { generationJobId: jobId },
          create: {
            generationJobId: jobId,
            adPrimaryText: results.copy.adPrimaryText,
            adHeadline: results.copy.adHeadline,
            adDescription: results.copy.adDescription,
            emailSubject: results.copy.emailSubject,
            emailBody: results.copy.emailBody,
            salesScriptHook: results.copy.salesScriptHook,
            rawData: results.copy
          },
          update: {
            adPrimaryText: results.copy.adPrimaryText,
            adHeadline: results.copy.adHeadline,
            adDescription: results.copy.adDescription,
            emailSubject: results.copy.emailSubject,
            emailBody: results.copy.emailBody,
            salesScriptHook: results.copy.salesScriptHook,
            rawData: results.copy
          }
        });
      }

      if (results.creatives) {
        await tx.creativeMockup.upsert({
          where: { generationJobId: jobId },
          create: {
            generationJobId: jobId,
            hooks: results.creatives.hooks,
            visualDirections: results.creatives.visualDirections,
            concepts: results.creatives.concepts,
            rawData: results.creatives
          },
          update: {
            hooks: results.creatives.hooks,
            visualDirections: results.creatives.visualDirections,
            concepts: results.creatives.concepts,
            rawData: results.creatives
          }
        });
      }
    });
  }

  async getLatestJobByProject(projectId: string) {
    return prisma.generationJob.findFirst({
      where: { projectId },
      include: {
        steps: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
}

export const generationStepKeyByPart: Record<GenerationPart, string> = {
  landing: STEP_MAP.landing.key,
  copy: STEP_MAP.copy.key,
  creatives: STEP_MAP.creatives.key
};

