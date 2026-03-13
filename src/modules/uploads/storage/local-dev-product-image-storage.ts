import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ProductImageStorage, SaveProductImageInput, SaveProductImageOutput } from "./product-image-storage";

function sanitizeFileName(fileName: string): string {
  const normalized = fileName.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const compact = normalized.replace(/-+/g, "-");
  return compact.length > 0 ? compact : "product-image";
}

export class LocalDevProductImageStorage implements ProductImageStorage {
  private readonly uploadsRoot = path.resolve(process.cwd(), "storage", "uploads", "product-images");

  async save(input: SaveProductImageInput): Promise<SaveProductImageOutput> {
    const projectDir = path.join(this.uploadsRoot, input.projectId);
    await mkdir(projectDir, { recursive: true });

    const storedFileName = `${Date.now()}-${randomUUID()}-${sanitizeFileName(input.fileName)}`;
    const absolutePath = path.join(projectDir, storedFileName);

    await writeFile(absolutePath, input.buffer);

    const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");

    return {
      storageProvider: "LOCAL_DEV",
      storagePath: relativePath
    };
  }
}
