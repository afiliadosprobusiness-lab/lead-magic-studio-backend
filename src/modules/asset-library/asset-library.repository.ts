import { prisma } from "../../database/prisma";
import {
  mapObjectiveFromPrisma,
  mapPlatformFromPrisma,
  mapToneFromPrisma
} from "../copy-generator/copy-generator.types";
import type { AssetReferenceInputDto, AssetReferenceType } from "./asset-library.types";

function toConceptCount(value: unknown): number {
  if (!Array.isArray(value)) {
    return 0;
  }

  return value.length;
}

function mapAssetIdsByType(references: AssetReferenceInputDto[]): Record<AssetReferenceType, string[]> {
  return references.reduce<Record<AssetReferenceType, string[]>>(
    (acc, reference) => {
      acc[reference.type].push(reference.id);
      return acc;
    },
    {
      landing_mockup: [],
      copy_mockup: [],
      creative_mockup: [],
      ugc_result: [],
      generated_copy: []
    }
  );
}

export class AssetLibraryRepository {
  async listLandingMockups(projectId: string) {
    return prisma.landingMockup.findMany({
      where: {
        generationJob: {
          projectId
        }
      },
      select: {
        id: true,
        generationJobId: true,
        headline: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async listCopyMockups(projectId: string) {
    return prisma.copyMockup.findMany({
      where: {
        generationJob: {
          projectId
        }
      },
      select: {
        id: true,
        generationJobId: true,
        adHeadline: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async listCreativeMockups(projectId: string) {
    const rows = await prisma.creativeMockup.findMany({
      where: {
        generationJob: {
          projectId
        }
      },
      select: {
        id: true,
        generationJobId: true,
        concepts: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map((row) => ({
      id: row.id,
      generationJobId: row.generationJobId,
      conceptCount: toConceptCount(row.concepts),
      createdAt: row.createdAt
    }));
  }

  async listUGCResults(projectId: string) {
    const rows = await prisma.uGCGenerationResult.findMany({
      where: {
        generationJob: {
          projectId
        }
      },
      select: {
        id: true,
        generationJobId: true,
        creativeVariants: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map((row) => ({
      id: row.id,
      generationJobId: row.generationJobId,
      creativeVariantCount: toConceptCount(row.creativeVariants),
      createdAt: row.createdAt
    }));
  }

  async listGeneratedCopies(ownerId: string, projectId: string) {
    const rows = await prisma.generatedCopy.findMany({
      where: {
        ownerId,
        projectId
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map((row) => ({
      id: row.id,
      objective: mapObjectiveFromPrisma(row.objective),
      tone: mapToneFromPrisma(row.tone),
      platform: row.platform ? mapPlatformFromPrisma(row.platform) : null,
      headline: row.headline,
      createdAt: row.createdAt
    }));
  }

  async listCreativePacks(ownerId: string, projectId: string) {
    const rows = await prisma.creativePack.findMany({
      where: {
        ownerId,
        projectId
      },
      include: {
        items: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      itemCount: row.items.length,
      createdAt: row.createdAt
    }));
  }

  async validateAssetReferences(
    ownerId: string,
    projectId: string,
    references: AssetReferenceInputDto[]
  ): Promise<AssetReferenceInputDto[]> {
    if (!references.length) {
      return [];
    }

    const idsByType = mapAssetIdsByType(references);

    const [landingRows, copyRows, creativeRows, ugcRows, generatedCopyRows] = await Promise.all([
      idsByType.landing_mockup.length
        ? prisma.landingMockup.findMany({
            where: {
              id: { in: idsByType.landing_mockup },
              generationJob: {
                projectId
              }
            },
            select: { id: true }
          })
        : Promise.resolve([]),
      idsByType.copy_mockup.length
        ? prisma.copyMockup.findMany({
            where: {
              id: { in: idsByType.copy_mockup },
              generationJob: {
                projectId
              }
            },
            select: { id: true }
          })
        : Promise.resolve([]),
      idsByType.creative_mockup.length
        ? prisma.creativeMockup.findMany({
            where: {
              id: { in: idsByType.creative_mockup },
              generationJob: {
                projectId
              }
            },
            select: { id: true }
          })
        : Promise.resolve([]),
      idsByType.ugc_result.length
        ? prisma.uGCGenerationResult.findMany({
            where: {
              id: { in: idsByType.ugc_result },
              generationJob: {
                projectId
              }
            },
            select: { id: true }
          })
        : Promise.resolve([]),
      idsByType.generated_copy.length
        ? prisma.generatedCopy.findMany({
            where: {
              id: { in: idsByType.generated_copy },
              ownerId,
              projectId
            },
            select: { id: true }
          })
        : Promise.resolve([])
    ]);

    const foundByType: Record<AssetReferenceType, Set<string>> = {
      landing_mockup: new Set(landingRows.map((row) => row.id)),
      copy_mockup: new Set(copyRows.map((row) => row.id)),
      creative_mockup: new Set(creativeRows.map((row) => row.id)),
      ugc_result: new Set(ugcRows.map((row) => row.id)),
      generated_copy: new Set(generatedCopyRows.map((row) => row.id))
    };

    return references.filter((reference) => !foundByType[reference.type].has(reference.id));
  }

  async getLatestProjectAssetReferences(ownerId: string, projectId: string): Promise<AssetReferenceInputDto[]> {
    const references: AssetReferenceInputDto[] = [];

    const latestGeneration = await prisma.generationJob.findFirst({
      where: {
        projectId,
        status: "COMPLETED"
      },
      include: {
        landingMockup: {
          select: { id: true }
        },
        copyMockup: {
          select: { id: true }
        },
        creativeMockup: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    if (latestGeneration?.landingMockup) {
      references.push({
        type: "landing_mockup",
        id: latestGeneration.landingMockup.id,
        label: "Latest landing mockup"
      });
    }

    if (latestGeneration?.copyMockup) {
      references.push({
        type: "copy_mockup",
        id: latestGeneration.copyMockup.id,
        label: "Latest copy mockup"
      });
    }

    if (latestGeneration?.creativeMockup) {
      references.push({
        type: "creative_mockup",
        id: latestGeneration.creativeMockup.id,
        label: "Latest creative mockup"
      });
    }

    const latestUGCResult = await prisma.uGCGenerationResult.findFirst({
      where: {
        generationJob: {
          projectId
        }
      },
      select: { id: true },
      orderBy: { createdAt: "desc" }
    });

    if (latestUGCResult) {
      references.push({
        type: "ugc_result",
        id: latestUGCResult.id,
        label: "Latest UGC result"
      });
    }

    const latestGeneratedCopy = await prisma.generatedCopy.findFirst({
      where: {
        ownerId,
        projectId
      },
      select: {
        id: true,
        headline: true
      },
      orderBy: { createdAt: "desc" }
    });

    if (latestGeneratedCopy) {
      references.push({
        type: "generated_copy",
        id: latestGeneratedCopy.id,
        label: latestGeneratedCopy.headline
      });
    }

    return references;
  }
}
