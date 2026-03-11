export type ProjectStatus = "DRAFT" | "READY" | "GENERATING" | "FAILED" | "ARCHIVED";

export type ProjectInputDto = {
  offerName: string;
  offerDescription: string;
  targetAudience: string;
  painPoints: string[];
  benefits: string[];
  uniqueValueProposition: string;
  tone: string;
  callToAction: string;
  language: string;
  rawWizardData?: Record<string, unknown>;
};

export type CreateProjectDto = {
  name: string;
  input: ProjectInputDto;
};

export type DuplicateProjectDto = {
  name?: string;
};

export type ProjectSummaryDto = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  latestGenerationStatus: string | null;
};

export type ProjectDetailDto = {
  id: string;
  name: string;
  status: ProjectStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  input: ProjectInputDto | null;
};

