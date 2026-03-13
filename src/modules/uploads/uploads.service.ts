import { createHash } from "node:crypto";

import { AppError } from "../../common/errors/app-error";
import { ProjectsRepository } from "../projects/projects.repository";
import type { ProductImageStorage } from "./storage/product-image-storage";
import type { UploadedProductImageDto, UploadProductImagesDto } from "./uploads.types";
import { UploadsRepository } from "./uploads.repository";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function decodeBase64Payload(payload: string): Buffer {
  const normalized = payload.includes(",") ? payload.split(",").at(-1) ?? "" : payload;
  const cleanPayload = normalized.replace(/\s/g, "");

  if (!cleanPayload || cleanPayload.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(cleanPayload)) {
    throw AppError.badRequest("Invalid base64 payload for product image");
  }

  return Buffer.from(cleanPayload, "base64");
}

export class UploadsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly uploadsRepository: UploadsRepository,
    private readonly storage: ProductImageStorage
  ) {}

  async uploadProductImages(ownerId: string, payload: UploadProductImagesDto): Promise<{
    projectId: string;
    uploadedImages: UploadedProductImageDto[];
  }> {
    const project = await this.projectsRepository.findById(payload.projectId, ownerId);

    if (!project) {
      throw AppError.notFound("Project not found");
    }

    const recordsToCreate: Array<{
      projectId: string;
      storageProvider: string;
      storagePath: string;
      publicUrl?: string;
      originalFileName: string;
      mimeType: string;
      sizeBytes: number;
      checksumSha256: string;
    }> = [];

    for (const file of payload.files) {
      const buffer = decodeBase64Payload(file.contentBase64);

      if (!buffer.length) {
        throw AppError.badRequest(`File "${file.fileName}" has invalid base64 content`);
      }

      if (buffer.byteLength > MAX_FILE_BYTES) {
        throw AppError.badRequest(`File "${file.fileName}" exceeds max size of ${MAX_FILE_BYTES} bytes`);
      }

      const storageOutput = await this.storage.save({
        projectId: payload.projectId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        buffer
      });

      recordsToCreate.push({
        projectId: payload.projectId,
        storageProvider: storageOutput.storageProvider,
        storagePath: storageOutput.storagePath,
        publicUrl: storageOutput.publicUrl,
        originalFileName: file.fileName,
        mimeType: file.mimeType,
        sizeBytes: buffer.byteLength,
        checksumSha256: createHash("sha256").update(buffer).digest("hex")
      });
    }

    const created = await this.uploadsRepository.createProductImages(recordsToCreate);

    return {
      projectId: payload.projectId,
      uploadedImages: created.map((item) => ({
        id: item.id,
        projectId: item.projectId,
        storageProvider: item.storageProvider,
        storagePath: item.storagePath,
        publicUrl: item.publicUrl,
        originalFileName: item.originalFileName,
        mimeType: item.mimeType,
        sizeBytes: item.sizeBytes,
        checksumSha256: item.checksumSha256,
        createdAt: item.createdAt
      }))
    };
  }
}
