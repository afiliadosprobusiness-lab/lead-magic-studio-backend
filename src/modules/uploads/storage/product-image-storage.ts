import type { ProductImageMimeType } from "../uploads.types";

export type SaveProductImageInput = {
  projectId: string;
  fileName: string;
  mimeType: ProductImageMimeType;
  buffer: Buffer;
};

export type SaveProductImageOutput = {
  storageProvider: string;
  storagePath: string;
  publicUrl?: string;
};

export interface ProductImageStorage {
  save(input: SaveProductImageInput): Promise<SaveProductImageOutput>;
}
