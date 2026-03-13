import { AppError } from "../../common/errors/app-error";
import { AssetLibraryRepository } from "../asset-library/asset-library.repository";
import { ProjectHistoryService } from "../project-history/project-history.service";
import { ProjectsRepository } from "../projects/projects.repository";
import { PublisherDraftsRepository } from "./publisher-drafts.repository";
import type {
  CreatePublicationDraftDto,
  PublicationDraftDto,
  UpdatePublicationDraftDto
} from "./publisher-drafts.types";

export class PublisherDraftsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly publisherDraftsRepository: PublisherDraftsRepository,
    private readonly assetLibraryRepository: AssetLibraryRepository,
    private readonly projectHistoryService: ProjectHistoryService = new ProjectHistoryService()
  ) {}

  private async validateDraftRelations(
    ownerId: string,
    projectId: string,
    payload: Pick<UpdatePublicationDraftDto, "selectedAssetRefs" | "creativePackId" | "selectedCopyId">
  ): Promise<void> {
    if (payload.selectedAssetRefs) {
      const missingAssets = await this.assetLibraryRepository.validateAssetReferences(ownerId, projectId, payload.selectedAssetRefs);

      if (missingAssets.length) {
        throw AppError.badRequest("Some selected assets do not belong to this project", {
          missingAssets
        });
      }
    }

    if (payload.creativePackId) {
      const hasCreativePack = await this.publisherDraftsRepository.hasCreativePack(ownerId, projectId, payload.creativePackId);

      if (!hasCreativePack) {
        throw AppError.badRequest("creativePackId does not belong to this project");
      }
    }

    if (payload.selectedCopyId) {
      const hasCopy = await this.publisherDraftsRepository.hasGeneratedCopy(ownerId, projectId, payload.selectedCopyId);

      if (!hasCopy) {
        throw AppError.badRequest("selectedCopyId does not belong to this project");
      }
    }
  }

  async createDraft(ownerId: string, projectId: string, payload: CreatePublicationDraftDto): Promise<PublicationDraftDto> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    await this.validateDraftRelations(ownerId, projectId, payload);

    const created = await this.publisherDraftsRepository.create(ownerId, projectId, payload);

    await this.projectHistoryService.recordEventSafe({
      projectId,
      ownerId,
      eventType: "PUBLICATION_DRAFT_CREATED",
      entityType: "publication_draft",
      entityId: created.id,
      summary: `Created publication draft for ${created.platform}`,
      payload: {
        status: created.status,
        scheduledAt: created.scheduledAt?.toISOString() ?? null,
        creativePackId: created.creativePackId,
        selectedCopyId: created.selectedCopyId
      }
    });

    return created;
  }

  async listDrafts(ownerId: string, projectId: string): Promise<{ projectId: string; drafts: PublicationDraftDto[] }> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const drafts = await this.publisherDraftsRepository.listByProject(ownerId, projectId);

    return {
      projectId,
      drafts
    };
  }

  async getDraftById(ownerId: string, draftId: string): Promise<PublicationDraftDto> {
    const draft = await this.publisherDraftsRepository.findById(ownerId, draftId);

    if (!draft) {
      throw AppError.notFound("Publication draft not found");
    }

    return draft;
  }

  async updateDraft(ownerId: string, draftId: string, payload: UpdatePublicationDraftDto): Promise<PublicationDraftDto> {
    const existing = await this.publisherDraftsRepository.findById(ownerId, draftId);

    if (!existing) {
      throw AppError.notFound("Publication draft not found");
    }

    await this.validateDraftRelations(ownerId, existing.projectId, payload);

    const updated = await this.publisherDraftsRepository.update(ownerId, draftId, payload);

    if (!updated) {
      throw AppError.notFound("Publication draft not found");
    }

    return updated;
  }

  async deleteDraft(ownerId: string, draftId: string): Promise<void> {
    const removed = await this.publisherDraftsRepository.delete(ownerId, draftId);

    if (!removed) {
      throw AppError.notFound("Publication draft not found");
    }
  }
}
