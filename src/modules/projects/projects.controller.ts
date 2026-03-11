import type { Request, Response } from "express";

import { sendSuccess } from "../../common/http/api-response";
import type { GenerationService } from "../generation/generation.service";
import type { GenerateProjectDto } from "../generation/generation.types";
import type { MockupResultsService } from "../mockup-results/mockup-results.service";
import type { CreateProjectDto, DuplicateProjectDto } from "./projects.types";
import { ProjectsService } from "./projects.service";

export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly generationService: GenerationService,
    private readonly mockupResultsService: MockupResultsService
  ) {}

  private getProjectId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  async createProject(req: Request, res: Response): Promise<void> {
    const payload = req.body as CreateProjectDto;
    const project = await this.projectsService.createProject(req.auth.userId, payload);
    sendSuccess(res, 201, project);
  }

  async listProjects(req: Request, res: Response): Promise<void> {
    const projects = await this.projectsService.listProjects(req.auth.userId);
    sendSuccess(res, 200, projects);
  }

  async getProjectById(req: Request, res: Response): Promise<void> {
    const project = await this.projectsService.getProjectById(req.auth.userId, this.getProjectId(req));
    sendSuccess(res, 200, project);
  }

  async duplicateProject(req: Request, res: Response): Promise<void> {
    const payload = req.body as DuplicateProjectDto;
    const duplicate = await this.projectsService.duplicateProject(req.auth.userId, this.getProjectId(req), payload);
    sendSuccess(res, 201, duplicate);
  }

  async startGeneration(req: Request, res: Response): Promise<void> {
    const payload = req.body as GenerateProjectDto;
    const generation = await this.generationService.startGeneration(req.auth.userId, this.getProjectId(req), payload);
    sendSuccess(res, 202, generation);
  }

  async getGenerationStatus(req: Request, res: Response): Promise<void> {
    const generationStatus = await this.generationService.getGenerationStatus(req.auth.userId, this.getProjectId(req));
    sendSuccess(res, 200, generationStatus);
  }

  async getResults(req: Request, res: Response): Promise<void> {
    const results = await this.mockupResultsService.getProjectResults(req.auth.userId, this.getProjectId(req));
    sendSuccess(res, 200, results);
  }
}
