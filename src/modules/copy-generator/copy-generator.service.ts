import { AppError } from "../../common/errors/app-error";
import { ProjectHistoryService } from "../project-history/project-history.service";
import { ProjectsRepository } from "../projects/projects.repository";
import { CopyGeneratorRepository } from "./copy-generator.repository";
import { MockCopyGenerationEngine } from "./engine/mock-copy-generation-engine";
import type { CopyGenerationEngine } from "./engine/copy-generation-engine";
import type {
  DuplicateGeneratedCopyDto,
  GenerateProjectCopiesDto,
  GeneratedCopyDto,
  UpdateGeneratedCopyDto
} from "./copy-generator.types";

export class CopyGeneratorService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly copyGeneratorRepository: CopyGeneratorRepository,
    private readonly projectHistoryService: ProjectHistoryService = new ProjectHistoryService(),
    private readonly copyGenerationEngine: CopyGenerationEngine = new MockCopyGenerationEngine()
  ) {}

  async generateProjectCopies(
    ownerId: string,
    projectId: string,
    payload: GenerateProjectCopiesDto
  ): Promise<{ projectId: string; generatedCount: number; copies: GeneratedCopyDto[] }> {
    const project = await this.projectsRepository.findRecordById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    if (!project.projectInput) {
      throw AppError.badRequest("Project input is missing");
    }

    let templateId: string | undefined;
    let templateName: string | undefined;
    let templateText: string | undefined;
    let ctaDefault: string | undefined;

    if (payload.templateId) {
      const template = await this.copyGeneratorRepository.findTemplateById(ownerId, payload.templateId);

      if (!template) {
        throw AppError.notFound("Copy template not found");
      }

      templateId = template.id;
      templateName = template.name;
      templateText = template.templateText;
      ctaDefault = template.ctaDefault ?? undefined;
    }

    const generatedVariants = await this.copyGenerationEngine.generate({
      projectId: project.id,
      projectName: project.name,
      input: {
        offerName: project.projectInput.offerName,
        offerDescription: project.projectInput.offerDescription,
        targetAudience: project.projectInput.targetAudience,
        painPoints: Array.isArray(project.projectInput.painPoints)
          ? project.projectInput.painPoints.map((item) => String(item))
          : [],
        benefits: Array.isArray(project.projectInput.benefits)
          ? project.projectInput.benefits.map((item) => String(item))
          : [],
        uniqueValueProposition: project.projectInput.uniqueValueProposition,
        tone: project.projectInput.tone,
        callToAction: project.projectInput.callToAction,
        language: project.projectInput.language,
        rawWizardData: undefined
      },
      objective: payload.objective,
      tone: payload.tone,
      platform: payload.platform,
      language: payload.language ?? project.projectInput.language,
      templateName,
      templateText,
      ctaDefault,
      variants: payload.variants ?? 3
    });

    const copies = await this.copyGeneratorRepository.createMany({
      ownerId,
      projectId,
      sourceTemplateId: templateId,
      objective: payload.objective,
      tone: payload.tone,
      platform: payload.platform,
      language: payload.language ?? project.projectInput.language,
      variants: generatedVariants
    });

    for (const copy of copies) {
      await this.projectHistoryService.recordEventSafe({
        projectId,
        ownerId,
        eventType: "GENERATED_COPY_CREATED",
        entityType: "generated_copy",
        entityId: copy.id,
        summary: `Generated copy ${copy.id} (${copy.objective}/${copy.tone})`,
        payload: {
          objective: copy.objective,
          tone: copy.tone,
          platform: copy.platform
        }
      });
    }

    return {
      projectId,
      generatedCount: copies.length,
      copies
    };
  }

  async listProjectCopies(ownerId: string, projectId: string): Promise<{ projectId: string; copies: GeneratedCopyDto[] }> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const copies = await this.copyGeneratorRepository.listByProject(ownerId, projectId);

    return {
      projectId,
      copies
    };
  }

  async getCopyById(ownerId: string, copyId: string): Promise<GeneratedCopyDto> {
    const copy = await this.copyGeneratorRepository.findById(ownerId, copyId);

    if (!copy) {
      throw AppError.notFound("Generated copy not found");
    }

    return copy;
  }

  async duplicateCopy(ownerId: string, copyId: string, payload: DuplicateGeneratedCopyDto): Promise<GeneratedCopyDto> {
    const duplicated = await this.copyGeneratorRepository.duplicate(ownerId, copyId, payload);

    if (!duplicated) {
      throw AppError.notFound("Generated copy not found");
    }

    await this.projectHistoryService.recordEventSafe({
      projectId: duplicated.projectId,
      ownerId,
      eventType: "GENERATED_COPY_CREATED",
      entityType: "generated_copy",
      entityId: duplicated.id,
      summary: `Duplicated generated copy ${copyId}`,
      payload: {
        sourceCopyId: copyId
      }
    });

    return duplicated;
  }

  async updateCopy(ownerId: string, copyId: string, payload: UpdateGeneratedCopyDto): Promise<GeneratedCopyDto> {
    const updated = await this.copyGeneratorRepository.update(ownerId, copyId, payload);

    if (!updated) {
      throw AppError.notFound("Generated copy not found");
    }

    return updated;
  }

  async deleteCopy(ownerId: string, copyId: string): Promise<void> {
    const removed = await this.copyGeneratorRepository.delete(ownerId, copyId);

    if (!removed) {
      throw AppError.notFound("Generated copy not found");
    }
  }
}
