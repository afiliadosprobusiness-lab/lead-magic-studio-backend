import { AppError } from "../../common/errors/app-error";
import { ProjectsRepository } from "../projects/projects.repository";
import { AssetLibraryRepository } from "./asset-library.repository";
import type { AssetLibraryResponseDto } from "./asset-library.types";

export class AssetLibraryService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly assetLibraryRepository: AssetLibraryRepository
  ) {}

  async getProjectAssets(ownerId: string, projectId: string): Promise<AssetLibraryResponseDto> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const [landingMockups, copyMockups, creativeMockups, ugcResults, generatedCopies, creativePacks] =
      await Promise.all([
        this.assetLibraryRepository.listLandingMockups(projectId),
        this.assetLibraryRepository.listCopyMockups(projectId),
        this.assetLibraryRepository.listCreativeMockups(projectId),
        this.assetLibraryRepository.listUGCResults(projectId),
        this.assetLibraryRepository.listGeneratedCopies(ownerId, projectId),
        this.assetLibraryRepository.listCreativePacks(ownerId, projectId)
      ]);

    return {
      projectId,
      assets: {
        landingMockups,
        copyMockups,
        creativeMockups,
        ugcResults,
        generatedCopies,
        creativePacks
      }
    };
  }
}
