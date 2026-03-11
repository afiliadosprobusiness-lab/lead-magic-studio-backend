import { AppError } from "../../common/errors/app-error";
import type { GenerationService } from "../generation/generation.service";
import type { MockupResultsService } from "../mockup-results/mockup-results.service";
import type { DuplicateProjectDto, ProjectDetailDto, ProjectSummaryDto } from "./projects.types";
import { ProjectsRepository } from "./projects.repository";
import type { CreateProjectDto } from "./projects.types";

export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async createProject(ownerId: string, payload: CreateProjectDto): Promise<ProjectDetailDto> {
    return this.projectsRepository.create(ownerId, payload);
  }

  async listProjects(ownerId: string): Promise<ProjectSummaryDto[]> {
    return this.projectsRepository.list(ownerId);
  }

  async getProjectById(ownerId: string, projectId: string): Promise<ProjectDetailDto> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    return project;
  }

  async duplicateProject(ownerId: string, projectId: string, payload: DuplicateProjectDto): Promise<ProjectDetailDto> {
    const existingProject = await this.projectsRepository.findById(projectId, ownerId);

    if (!existingProject) {
      throw AppError.notFound("Project not found");
    }

    const duplicateName = payload.name?.trim() || `${existingProject.name} (Copy)`;
    const duplicatedProject = await this.projectsRepository.createDuplicate(ownerId, projectId, duplicateName);

    if (!duplicatedProject) {
      throw AppError.notFound("Source project input not found");
    }

    return duplicatedProject;
  }
}

export type ProjectsModuleServices = {
  projectsService: ProjectsService;
  generationService: GenerationService;
  mockupResultsService: MockupResultsService;
};

