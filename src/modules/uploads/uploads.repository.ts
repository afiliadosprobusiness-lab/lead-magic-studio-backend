import { prisma } from "../../database/prisma";

type CreateProductImageRecordInput = {
  projectId: string;
  storageProvider: string;
  storagePath: string;
  publicUrl?: string;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
};

export class UploadsRepository {
  async createProductImages(inputs: CreateProductImageRecordInput[]) {
    return prisma.$transaction(async (tx) => {
      const created = [];

      for (const input of inputs) {
        const row = await tx.uGCProductImage.create({
          data: {
            projectId: input.projectId,
            storageProvider: input.storageProvider,
            storagePath: input.storagePath,
            publicUrl: input.publicUrl,
            originalFileName: input.originalFileName,
            mimeType: input.mimeType,
            sizeBytes: input.sizeBytes,
            checksumSha256: input.checksumSha256
          }
        });
        created.push(row);
      }

      return created;
    });
  }
}
