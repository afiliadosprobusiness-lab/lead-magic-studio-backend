import type { UGCGenerationResultPayload, GenerateUGCDto } from "../ugc.types";

export type UGCProviderImageInput = {
  id: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type UGCProviderContext = {
  projectId: string;
  projectName: string;
  request: GenerateUGCDto;
  images: UGCProviderImageInput[];
};

export interface UGCGenerationProvider {
  generate(context: UGCProviderContext): Promise<Omit<UGCGenerationResultPayload, "safetyMetadata" | "disclosureFlags">>;
}
