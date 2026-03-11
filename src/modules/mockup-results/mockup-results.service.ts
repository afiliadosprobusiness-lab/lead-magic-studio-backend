import { AppError } from "../../common/errors/app-error";
import type { ProjectsRepository } from "../projects/projects.repository";
import { MockupResultsRepository } from "./mockup-results.repository";

export class MockupResultsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly mockupResultsRepository: MockupResultsRepository
  ) {}

  async getProjectResults(ownerId: string, projectId: string) {
    const project = await this.projectsRepository.findById(projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const latestResults = await this.mockupResultsRepository.getLatestCompletedResultsByProject(projectId);

    if (!latestResults) {
      return {
        projectId,
        generationId: null,
        results: {
          landing: null,
          copy: null,
          creatives: null
        }
      };
    }

    return {
      projectId,
      generationId: latestResults.id,
      results: {
        landing: latestResults.landingMockup
          ? {
              id: latestResults.landingMockup.id,
              headline: latestResults.landingMockup.headline,
              subheadline: latestResults.landingMockup.subheadline,
              ctaText: latestResults.landingMockup.ctaText,
              sections: latestResults.landingMockup.sections
            }
          : null,
        copy: latestResults.copyMockup
          ? {
              id: latestResults.copyMockup.id,
              adPrimaryText: latestResults.copyMockup.adPrimaryText,
              adHeadline: latestResults.copyMockup.adHeadline,
              adDescription: latestResults.copyMockup.adDescription,
              emailSubject: latestResults.copyMockup.emailSubject,
              emailBody: latestResults.copyMockup.emailBody,
              salesScriptHook: latestResults.copyMockup.salesScriptHook
            }
          : null,
        creatives: latestResults.creativeMockup
          ? {
              id: latestResults.creativeMockup.id,
              hooks: latestResults.creativeMockup.hooks,
              visualDirections: latestResults.creativeMockup.visualDirections,
              concepts: latestResults.creativeMockup.concepts
            }
          : null
      }
    };
  }
}

