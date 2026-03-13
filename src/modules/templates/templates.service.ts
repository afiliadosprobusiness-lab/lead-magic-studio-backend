import { AppError } from "../../common/errors/app-error";
import { ProjectHistoryService } from "../project-history/project-history.service";
import { ProjectsRepository } from "../projects/projects.repository";
import { TemplatesRepository } from "./templates.repository";
import type {
  CopyTemplateDto,
  CreateCopyTemplateDto,
  ListCopyTemplatesQueryDto,
  UpdateCopyTemplateDto
} from "./templates.types";

export class TemplatesService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly templatesRepository: TemplatesRepository,
    private readonly projectHistoryService: ProjectHistoryService = new ProjectHistoryService()
  ) {}

  async listTemplates(ownerId: string, query: ListCopyTemplatesQueryDto): Promise<CopyTemplateDto[]> {
    return this.templatesRepository.list(ownerId, query);
  }

  async createTemplate(ownerId: string, payload: CreateCopyTemplateDto): Promise<CopyTemplateDto> {
    if (payload.projectId) {
      const project = await this.projectsRepository.findById(payload.projectId, ownerId);

      if (!project) {
        throw AppError.notFound("Project not found");
      }
    }

    const created = await this.templatesRepository.create(ownerId, payload);

    if (created.projectId) {
      await this.projectHistoryService.recordEventSafe({
        projectId: created.projectId,
        ownerId,
        eventType: "COPY_TEMPLATE_CREATED",
        entityType: "copy_template",
        entityId: created.id,
        summary: `Created copy template ${created.name}`,
        payload: {
          isPreset: created.isPreset,
          objective: created.objective,
          tone: created.tone,
          platform: created.platform
        }
      });
    }

    return created;
  }

  async updateTemplate(ownerId: string, templateId: string, payload: UpdateCopyTemplateDto): Promise<CopyTemplateDto> {
    const existing = await this.templatesRepository.findById(ownerId, templateId);

    if (!existing || existing.ownerId !== ownerId) {
      throw AppError.notFound("Copy template not found");
    }

    if (existing.isSystem) {
      throw AppError.badRequest("System templates cannot be updated");
    }

    if (payload.projectId) {
      const project = await this.projectsRepository.findById(payload.projectId, ownerId);

      if (!project) {
        throw AppError.notFound("Project not found");
      }
    }

    const updated = await this.templatesRepository.update(ownerId, templateId, payload);

    if (!updated) {
      throw AppError.notFound("Copy template not found");
    }

    return updated;
  }

  async deleteTemplate(ownerId: string, templateId: string): Promise<void> {
    const existing = await this.templatesRepository.findById(ownerId, templateId);

    if (!existing || existing.ownerId !== ownerId) {
      throw AppError.notFound("Copy template not found");
    }

    if (existing.isSystem) {
      throw AppError.badRequest("System templates cannot be deleted");
    }

    const removed = await this.templatesRepository.delete(ownerId, templateId);

    if (!removed) {
      throw AppError.notFound("Copy template not found");
    }
  }
}
