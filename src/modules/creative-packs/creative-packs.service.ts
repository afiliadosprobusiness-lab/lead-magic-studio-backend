import { AppError } from "../../common/errors/app-error";
import { AssetLibraryRepository } from "../asset-library/asset-library.repository";
import { CopyGeneratorRepository } from "../copy-generator/copy-generator.repository";
import { ProjectHistoryService } from "../project-history/project-history.service";
import { ProjectsRepository } from "../projects/projects.repository";
import { CreativePacksRepository } from "./creative-packs.repository";
import type { CreateCreativePackDto, CreativePackDto } from "./creative-packs.types";

function dedupeAssets(assets: NonNullable<CreateCreativePackDto["assets"]>) {
  const seen = new Set<string>();
  const unique = [] as NonNullable<CreateCreativePackDto["assets"]>;

  for (const asset of assets) {
    const key = `${asset.type}:${asset.id}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(asset);
  }

  return unique;
}

export class CreativePacksService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly creativePacksRepository: CreativePacksRepository,
    private readonly assetLibraryRepository: AssetLibraryRepository,
    private readonly copyGeneratorRepository: CopyGeneratorRepository,
    private readonly projectHistoryService: ProjectHistoryService = new ProjectHistoryService()
  ) {}

  async createCreativePack(ownerId: string, projectId: string, payload: CreateCreativePackDto): Promise<CreativePackDto> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    if (payload.createdFromCopyId) {
      const sourceCopy = await this.copyGeneratorRepository.findByIdForProject(ownerId, projectId, payload.createdFromCopyId);

      if (!sourceCopy) {
        throw AppError.badRequest("createdFromCopyId does not belong to this project");
      }
    }

    const requestedAssets = payload.assets?.length
      ? dedupeAssets(payload.assets)
      : await this.assetLibraryRepository.getLatestProjectAssetReferences(ownerId, projectId);

    if (!requestedAssets.length) {
      throw AppError.badRequest("No assets available for this project. Provide explicit asset references first.");
    }

    const missingAssets = await this.assetLibraryRepository.validateAssetReferences(ownerId, projectId, requestedAssets);

    if (missingAssets.length) {
      throw AppError.badRequest("Some assets do not belong to this project", {
        missingAssets
      });
    }

    const created = await this.creativePacksRepository.createPack({
      ownerId,
      projectId,
      name: payload.name,
      objective: payload.objective,
      tone: payload.tone,
      platform: payload.platform,
      notes: payload.notes,
      createdFromCopyId: payload.createdFromCopyId,
      assets: requestedAssets
    });

    await this.projectHistoryService.recordEventSafe({
      projectId,
      ownerId,
      eventType: "CREATIVE_PACK_CREATED",
      entityType: "creative_pack",
      entityId: created.id,
      summary: `Created creative pack ${created.name}`,
      payload: {
        itemCount: created.items.length,
        objective: created.objective,
        tone: created.tone,
        platform: created.platform
      }
    });

    return created;
  }

  async listCreativePacks(ownerId: string, projectId: string): Promise<{ projectId: string; creativePacks: CreativePackDto[] }> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const creativePacks = await this.creativePacksRepository.listByProject(ownerId, projectId);

    return {
      projectId,
      creativePacks
    };
  }

  async getCreativePackById(ownerId: string, creativePackId: string): Promise<CreativePackDto> {
    const creativePack = await this.creativePacksRepository.findById(ownerId, creativePackId);

    if (!creativePack) {
      throw AppError.notFound("Creative pack not found");
    }

    return creativePack;
  }
}
