import { Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma";
import type {
  UGCContentPolicyCheck,
  UGCCreativeType,
  UGCGenerationResultPayload,
  UGCOutputFormat,
  UGCTargetPlatform
} from "./ugc.types";
import { UGC_CONTENT_POLICY_CHECKS, UGC_CREATIVE_TYPES, UGC_OUTPUT_FORMATS, UGC_TARGET_PLATFORMS } from "./ugc.types";

type UGCJobRecord = Prisma.UGCGenerationJobGetPayload<{
  include: {
    images: {
      include: {
        productImage: true;
      };
    };
  };
}>;

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function fromJsonStringArray(value: Prisma.JsonValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item));
}

function toOutputFormats(value: Prisma.JsonValue): UGCOutputFormat[] {
  const values = fromJsonStringArray(value);
  return values.filter((item): item is UGCOutputFormat =>
    UGC_OUTPUT_FORMATS.includes(item as (typeof UGC_OUTPUT_FORMATS)[number])
  );
}

function toPolicyChecks(value: Prisma.JsonValue): UGCContentPolicyCheck[] {
  const values = fromJsonStringArray(value);
  return values.filter((item): item is UGCContentPolicyCheck =>
    UGC_CONTENT_POLICY_CHECKS.includes(item as (typeof UGC_CONTENT_POLICY_CHECKS)[number])
  );
}

function toCreativeType(value: string): UGCCreativeType {
  if (UGC_CREATIVE_TYPES.includes(value as UGCCreativeType)) {
    return value as UGCCreativeType;
  }

  return UGC_CREATIVE_TYPES[0];
}

function toTargetPlatform(value: string): UGCTargetPlatform {
  if (UGC_TARGET_PLATFORMS.includes(value as UGCTargetPlatform)) {
    return value as UGCTargetPlatform;
  }

  return UGC_TARGET_PLATFORMS[0];
}

export class UGCRepository {
  async findProductImagesByIds(projectId: string, imageIds: string[]) {
    return prisma.uGCProductImage.findMany({
      where: {
        projectId,
        id: { in: imageIds }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  async createJob(input: {
    projectId: string;
    productImageIds: string[];
    creativeType: string;
    targetPlatform: string;
    scenePreset: string;
    avatarPreset: string;
    toneStyle: string;
    outputFormats: UGCOutputFormat[];
    brandSafeMode: boolean;
    disclosureEnabled: boolean;
    contentPolicyChecks: UGCContentPolicyCheck[];
    requestPayload: unknown;
  }): Promise<UGCJobRecord> {
    return prisma.uGCGenerationJob.create({
      data: {
        projectId: input.projectId,
        status: "QUEUED",
        progress: 0,
        requestPayload: toJsonValue(input.requestPayload),
        creativeType: input.creativeType,
        targetPlatform: input.targetPlatform,
        scenePreset: input.scenePreset,
        avatarPreset: input.avatarPreset,
        toneStyle: input.toneStyle,
        outputFormats: toJsonValue(input.outputFormats),
        brandSafeMode: input.brandSafeMode,
        disclosureEnabled: input.disclosureEnabled,
        contentPolicyChecks: toJsonValue(input.contentPolicyChecks),
        images: {
          create: input.productImageIds.map((imageId) => ({
            productImageId: imageId
          }))
        }
      },
      include: {
        images: {
          include: {
            productImage: true
          }
        }
      }
    });
  }

  async markJobProcessing(jobId: string): Promise<void> {
    await prisma.uGCGenerationJob.update({
      where: { id: jobId },
      data: {
        status: "PROCESSING",
        progress: 15,
        startedAt: new Date(),
        errorMessage: null
      }
    });
  }

  async updateJobProgress(jobId: string, progress: number): Promise<void> {
    await prisma.uGCGenerationJob.update({
      where: { id: jobId },
      data: { progress }
    });
  }

  async markJobCompleted(jobId: string): Promise<void> {
    await prisma.uGCGenerationJob.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        completedAt: new Date(),
        errorMessage: null
      }
    });
  }

  async markJobFailed(jobId: string, errorMessage: string): Promise<void> {
    await prisma.uGCGenerationJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage
      }
    });
  }

  async saveResult(jobId: string, result: UGCGenerationResultPayload, rawProviderResponse?: unknown): Promise<void> {
    await prisma.uGCGenerationResult.upsert({
      where: { generationJobId: jobId },
      create: {
        generationJobId: jobId,
        creativeVariants: toJsonValue(result.creativeVariants),
        imageResultReferences: toJsonValue(result.imageResultReferences),
        hookSuggestions: toJsonValue(result.hookSuggestions),
        shortCopySuggestions: toJsonValue(result.shortCopySuggestions),
        ctaSuggestions: toJsonValue(result.ctaSuggestions),
        placementFormats: toJsonValue(result.placementFormats),
        disclosureFlags: toJsonValue(result.disclosureFlags),
        safetyMetadata: toJsonValue(result.safetyMetadata),
        rawProviderResponse: rawProviderResponse ? toJsonValue(rawProviderResponse) : undefined
      },
      update: {
        creativeVariants: toJsonValue(result.creativeVariants),
        imageResultReferences: toJsonValue(result.imageResultReferences),
        hookSuggestions: toJsonValue(result.hookSuggestions),
        shortCopySuggestions: toJsonValue(result.shortCopySuggestions),
        ctaSuggestions: toJsonValue(result.ctaSuggestions),
        placementFormats: toJsonValue(result.placementFormats),
        disclosureFlags: toJsonValue(result.disclosureFlags),
        safetyMetadata: toJsonValue(result.safetyMetadata),
        rawProviderResponse: rawProviderResponse ? toJsonValue(rawProviderResponse) : undefined
      }
    });
  }

  async findJobById(ownerId: string, jobId: string): Promise<UGCJobRecord | null> {
    return prisma.uGCGenerationJob.findFirst({
      where: {
        id: jobId,
        project: {
          ownerId
        }
      },
      include: {
        images: {
          include: {
            productImage: true
          }
        }
      }
    });
  }

  async findJobsByProject(ownerId: string, projectId: string): Promise<UGCJobRecord[]> {
    return prisma.uGCGenerationJob.findMany({
      where: {
        projectId,
        project: {
          ownerId
        }
      },
      include: {
        images: {
          include: {
            productImage: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async findJobResult(ownerId: string, jobId: string) {
    return prisma.uGCGenerationResult.findFirst({
      where: {
        generationJobId: jobId,
        generationJob: {
          project: {
            ownerId
          }
        }
      },
      include: {
        generationJob: {
          include: {
            images: {
              include: {
                productImage: true
              }
            }
          }
        }
      }
    });
  }

  mapJob(record: UGCJobRecord) {
    return {
      id: record.id,
      projectId: record.projectId,
      status: record.status,
      progress: record.progress,
      creativeType: toCreativeType(record.creativeType),
      targetPlatform: toTargetPlatform(record.targetPlatform),
      scenePreset: record.scenePreset,
      avatarPreset: record.avatarPreset,
      toneStyle: record.toneStyle,
      outputFormats: toOutputFormats(record.outputFormats),
      brandSafeMode: record.brandSafeMode,
      disclosureEnabled: record.disclosureEnabled,
      contentPolicyChecks: toPolicyChecks(record.contentPolicyChecks),
      productImageIds: record.images.map((image) => image.productImageId),
      errorMessage: record.errorMessage,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  mapResult(record: NonNullable<Awaited<ReturnType<UGCRepository["findJobResult"]>>>) {
    return {
      jobId: record.generationJobId,
      projectId: record.generationJob.projectId,
      status: record.generationJob.status,
      result: {
        creativeVariants: record.creativeVariants,
        imageResultReferences: record.imageResultReferences,
        hookSuggestions: record.hookSuggestions,
        shortCopySuggestions: record.shortCopySuggestions,
        ctaSuggestions: record.ctaSuggestions,
        placementFormats: record.placementFormats,
        disclosureFlags: record.disclosureFlags,
        safetyMetadata: record.safetyMetadata
      } as UGCGenerationResultPayload
    };
  }
}
