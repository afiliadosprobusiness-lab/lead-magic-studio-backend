import type { ProjectInputDto } from "../projects/projects.types";

export type GenerationPart = "landing" | "copy" | "creatives";

export type GenerateProjectDto = {
  parts?: GenerationPart[];
};

export type LandingMockupDto = {
  headline: string;
  subheadline: string;
  ctaText: string;
  sections: Array<{ title: string; description: string }>;
};

export type CopyMockupDto = {
  adPrimaryText: string;
  adHeadline: string;
  adDescription: string;
  emailSubject: string;
  emailBody: string;
  salesScriptHook: string;
};

export type CreativeConceptDto = {
  title: string;
  visualAngle: string;
  message: string;
  format: "image" | "video";
};

export type CreativeMockupDto = {
  hooks: string[];
  visualDirections: string[];
  concepts: CreativeConceptDto[];
};

export type GenerationResultPayload = {
  landing?: LandingMockupDto;
  copy?: CopyMockupDto;
  creatives?: CreativeMockupDto;
};

export type GenerationContext = {
  projectId: string;
  projectName: string;
  input: ProjectInputDto;
  requestedParts: GenerationPart[];
};

