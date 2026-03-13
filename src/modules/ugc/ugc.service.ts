import { AppError } from "../../common/errors/app-error";
import { ProjectHistoryService } from "../project-history/project-history.service";
import { ProjectsRepository } from "../projects/projects.repository";
import { BrandSafeUGCService } from "./brand-safe/brand-safe-ugc.service";
import { MockUGCGenerationProvider } from "./providers/mock-ugc-generation-provider";
import type { UGCGenerationProvider } from "./providers/ugc-generation-provider";
import { UGCRepository } from "./ugc.repository";
import { UGC_AVATAR_PRESETS, UGC_SCENE_PRESETS } from "./ugc.presets";
import type { GenerateUGCDto, UGCJobResultsDto, UGCGenerationJobDto } from "./ugc.types";
import { UGC_CONTENT_POLICY_CHECKS } from "./ugc.types";

export class UGCService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly ugcRepository: UGCRepository,
    private readonly generationProvider: UGCGenerationProvider = new MockUGCGenerationProvider(),
    private readonly brandSafeService: BrandSafeUGCService = new BrandSafeUGCService(),
    private readonly projectHistoryService: ProjectHistoryService = new ProjectHistoryService()
  ) {}

  async generate(ownerId: string, payload: GenerateUGCDto): Promise<{ projectId: string; job: UGCGenerationJobDto }> {
    const project = await this.projectsRepository.findById(payload.projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const brandSafeAssessment = this.brandSafeService.enforceRequestPolicy(payload);
    const checks = payload.contentPolicyChecks?.length ? payload.contentPolicyChecks : [...UGC_CONTENT_POLICY_CHECKS];
    const productImages = await this.ugcRepository.findProductImagesByIds(payload.projectId, payload.productImageIds);

    if (productImages.length !== payload.productImageIds.length) {
      throw AppError.badRequest("Some productImageIds are invalid for this project");
    }

    const job = await this.ugcRepository.createJob({
      projectId: payload.projectId,
      productImageIds: payload.productImageIds,
      creativeType: payload.creativeType,
      targetPlatform: payload.targetPlatform,
      scenePreset: payload.scenePreset,
      avatarPreset: payload.avatarPreset,
      toneStyle: payload.toneStyle,
      outputFormats: payload.outputFormats,
      brandSafeMode: payload.brandSafeMode,
      disclosureEnabled: payload.disclosureEnabled,
      contentPolicyChecks: checks,
      requestPayload: payload
    });
    await this.projectHistoryService.recordEventSafe({
      projectId: payload.projectId,
      ownerId,
      eventType: "UGC_JOB_CREATED",
      entityType: "ugc_job",
      entityId: job.id,
      summary: `UGC job created for ${payload.targetPlatform}`,
      payload: {
        creativeType: payload.creativeType,
        targetPlatform: payload.targetPlatform
      }
    });

    await this.ugcRepository.markJobProcessing(job.id);

    try {
      const providerResult = await this.generationProvider.generate({
        projectId: payload.projectId,
        projectName: project.name,
        request: payload,
        images: productImages.map((image) => ({
          id: image.id,
          originalFileName: image.originalFileName,
          mimeType: image.mimeType,
          sizeBytes: image.sizeBytes
        }))
      });

      await this.ugcRepository.updateJobProgress(job.id, 80);

      const moderationResult = this.brandSafeService.enforceOutputPolicy(providerResult);
      const finalResult = {
        ...moderationResult.filteredResult,
        disclosureFlags: {
          enabled: payload.disclosureEnabled,
          label: this.brandSafeService.getDisclosureLabel(payload.disclosureEnabled),
          requiredByBrandSafe: payload.brandSafeMode
        },
        safetyMetadata: {
          brandSafeMode: payload.brandSafeMode,
          appliedChecks: brandSafeAssessment.appliedChecks,
          blockedClaimCount: moderationResult.blockedClaims.length,
          filteredClaims: moderationResult.blockedClaims,
          warnings: [...brandSafeAssessment.warnings, ...moderationResult.warnings]
        }
      };

      await this.ugcRepository.saveResult(job.id, finalResult, providerResult);
      await this.ugcRepository.markJobCompleted(job.id);
      await this.projectHistoryService.recordEventSafe({
        projectId: payload.projectId,
        ownerId,
        eventType: "UGC_JOB_COMPLETED",
        entityType: "ugc_job",
        entityId: job.id,
        summary: "UGC job completed",
        payload: {
          targetPlatform: payload.targetPlatform
        }
      });

      const completedJob = await this.ugcRepository.findJobById(ownerId, job.id);

      if (!completedJob) {
        throw AppError.internal("UGC job not found after completion");
      }

      return {
        projectId: payload.projectId,
        job: this.ugcRepository.mapJob(completedJob)
      };
    } catch (error) {
      await this.ugcRepository.markJobFailed(
        job.id,
        error instanceof Error ? error.message : "Unexpected UGC generation error"
      );
      await this.projectHistoryService.recordEventSafe({
        projectId: payload.projectId,
        ownerId,
        eventType: "UGC_JOB_FAILED",
        entityType: "ugc_job",
        entityId: job.id,
        summary: "UGC job failed",
        payload: {
          error: error instanceof Error ? error.message : "Unexpected UGC generation error"
        }
      });
      throw AppError.internal("UGC generation failed");
    }
  }

  async getJob(ownerId: string, jobId: string): Promise<UGCGenerationJobDto> {
    const job = await this.ugcRepository.findJobById(ownerId, jobId);

    if (!job) {
      throw AppError.notFound("UGC job not found");
    }

    return this.ugcRepository.mapJob(job);
  }

  async getJobResults(ownerId: string, jobId: string): Promise<UGCJobResultsDto> {
    const job = await this.ugcRepository.findJobById(ownerId, jobId);

    if (!job) {
      throw AppError.notFound("UGC job not found");
    }

    const result = await this.ugcRepository.findJobResult(ownerId, jobId);

    if (!result) {
      return {
        jobId,
        projectId: job.projectId,
        status: job.status,
        result: null
      };
    }

    return this.ugcRepository.mapResult(result);
  }

  async listJobsByProject(ownerId: string, projectId: string): Promise<{ projectId: string; jobs: UGCGenerationJobDto[] }> {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const jobs = await this.ugcRepository.findJobsByProject(ownerId, projectId);

    return {
      projectId,
      jobs: jobs.map((job) => this.ugcRepository.mapJob(job))
    };
  }

  getScenePresets() {
    return UGC_SCENE_PRESETS;
  }

  getAvatarPresets() {
    return UGC_AVATAR_PRESETS;
  }
}
