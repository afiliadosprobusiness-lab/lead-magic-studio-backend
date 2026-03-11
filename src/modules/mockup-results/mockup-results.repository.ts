import { prisma } from "../../database/prisma";

export class MockupResultsRepository {
  async getLatestCompletedResultsByProject(projectId: string) {
    return prisma.generationJob.findFirst({
      where: {
        projectId,
        status: "COMPLETED"
      },
      include: {
        landingMockup: true,
        copyMockup: true,
        creativeMockup: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
}

