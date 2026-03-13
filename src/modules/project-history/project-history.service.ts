import { logger } from "../../config/logger";
import { AppError } from "../../common/errors/app-error";
import { ProjectsRepository } from "../projects/projects.repository";
import { ProjectHistoryRepository } from "./project-history.repository";
import type { ProjectHistoryEventDto, RecordProjectHistoryEventDto } from "./project-history.types";

export class ProjectHistoryService {
  constructor(
    private readonly projectsRepository: ProjectsRepository = new ProjectsRepository(),
    private readonly projectHistoryRepository: ProjectHistoryRepository = new ProjectHistoryRepository()
  ) {}

  async recordEvent(input: RecordProjectHistoryEventDto): Promise<ProjectHistoryEventDto> {
    return this.projectHistoryRepository.create(input);
  }

  async recordEventSafe(input: RecordProjectHistoryEventDto): Promise<void> {
    try {
      await this.projectHistoryRepository.create(input);
    } catch (error) {
      logger.warn(
        {
          err: error,
          projectId: input.projectId,
          ownerId: input.ownerId,
          eventType: input.eventType,
          entityType: input.entityType,
          entityId: input.entityId
        },
        "Project history event failed"
      );
    }
  }

  async listProjectHistory(ownerId: string, projectId: string, limit: number): Promise<ProjectHistoryEventDto[]> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    return this.projectHistoryRepository.listByProject(ownerId, projectId, limit);
  }
}
