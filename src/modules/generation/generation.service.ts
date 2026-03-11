import { AppError } from "../../common/errors/app-error";
import type { ProjectsRepository } from "../projects/projects.repository";
import type { ProjectDetailDto } from "../projects/projects.types";
import { generationStepKeyByPart, GenerationRepository } from "./generation.repository";
import { MockGenerationEngine } from "./engine/mock-generation-engine";
import type { GenerationEngine } from "./engine/generation-engine";
import type { GenerateProjectDto, GenerationPart } from "./generation.types";

const DEFAULT_GENERATION_PARTS: GenerationPart[] = ["landing", "copy", "creatives"];

export class GenerationService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly generationRepository: GenerationRepository,
    private readonly generationEngine: GenerationEngine = new MockGenerationEngine()
  ) {}

  async startGeneration(ownerId: string, projectId: string, payload: GenerateProjectDto) {
    const project = await this.projectsRepository.findRecordById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    if (!project.projectInput) {
      throw AppError.badRequest("Project input is missing");
    }

    const requestedParts = payload.parts?.length ? payload.parts : DEFAULT_GENERATION_PARTS;
    const job = await this.generationRepository.createJob(projectId, requestedParts);

    await this.projectsRepository.updateStatus(projectId, "GENERATING");
    await this.generationRepository.updateJobStatus(job.id, "PROCESSING");

    try {
      for (const part of requestedParts) {
        const stepKey = generationStepKeyByPart[part];
        await this.generationRepository.updateStepStatus(job.id, stepKey, "RUNNING");
      }

      const generatedResult = await this.generationEngine.generate({
        projectId: project.id,
        projectName: project.name,
        requestedParts,
        input: {
          offerName: project.projectInput.offerName,
          offerDescription: project.projectInput.offerDescription,
          targetAudience: project.projectInput.targetAudience,
          painPoints: project.projectInput.painPoints as string[],
          benefits: project.projectInput.benefits as string[],
          uniqueValueProposition: project.projectInput.uniqueValueProposition,
          tone: project.projectInput.tone,
          callToAction: project.projectInput.callToAction,
          language: project.projectInput.language,
          rawWizardData: (project.projectInput.rawWizardData ?? undefined) as Record<string, unknown> | undefined
        }
      });

      await this.generationRepository.saveResults(job.id, generatedResult);

      for (const part of requestedParts) {
        const stepKey = generationStepKeyByPart[part];
        await this.generationRepository.updateStepStatus(job.id, stepKey, "COMPLETED");
      }

      await this.generationRepository.updateJobStatus(job.id, "COMPLETED");
      await this.projectsRepository.updateStatus(project.id, "READY");

      const latestJob = await this.generationRepository.getLatestJobByProject(project.id);

      return {
        projectId: project.id,
        generation: latestJob
      };
    } catch (error) {
      for (const part of requestedParts) {
        const stepKey = generationStepKeyByPart[part];
        await this.generationRepository.updateStepStatus(
          job.id,
          stepKey,
          "FAILED",
          error instanceof Error ? error.message : "Unexpected generation error"
        );
      }

      await this.generationRepository.updateJobStatus(
        job.id,
        "FAILED",
        error instanceof Error ? error.message : "Unexpected generation error"
      );
      await this.projectsRepository.updateStatus(project.id, "FAILED");

      throw AppError.internal("Generation failed");
    }
  }

  async getGenerationStatus(ownerId: string, projectId: string) {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const latestJob = await this.generationRepository.getLatestJobByProject(projectId);

    return {
      projectId,
      projectStatus: project.status,
      generation: latestJob
    };
  }
}

export type GenerationStatusResponse = Awaited<ReturnType<GenerationService["getGenerationStatus"]>>;
export type StartGenerationResponse = Awaited<ReturnType<GenerationService["startGeneration"]>>;
export type ProjectForGeneration = ProjectDetailDto;

