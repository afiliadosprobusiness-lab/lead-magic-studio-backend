export const PRODUCT_IMAGE_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type ProductImageMimeType = (typeof PRODUCT_IMAGE_ALLOWED_MIME_TYPES)[number];

export type ProductImageInputFile = {
  fileName: string;
  mimeType: ProductImageMimeType;
  contentBase64: string;
};

export type UploadProductImagesDto = {
  projectId: string;
  files: ProductImageInputFile[];
};

export type UploadedProductImageDto = {
  id: string;
  projectId: string;
  storageProvider: string;
  storagePath: string;
  publicUrl: string | null;
  originalFileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  createdAt: Date;
};
