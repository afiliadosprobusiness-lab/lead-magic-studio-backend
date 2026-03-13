-- CreateTable
CREATE TABLE "UGCProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UGCProductImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UGCGenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "requestPayload" JSONB NOT NULL,
    "creativeType" TEXT NOT NULL,
    "targetPlatform" TEXT NOT NULL,
    "scenePreset" TEXT NOT NULL,
    "avatarPreset" TEXT NOT NULL,
    "toneStyle" TEXT NOT NULL,
    "outputFormats" JSONB NOT NULL,
    "brandSafeMode" BOOLEAN NOT NULL DEFAULT true,
    "disclosureEnabled" BOOLEAN NOT NULL DEFAULT true,
    "contentPolicyChecks" JSONB NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UGCGenerationJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UGCGenerationJobImage" (
    "generationJobId" TEXT NOT NULL,
    "productImageId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("generationJobId", "productImageId"),
    CONSTRAINT "UGCGenerationJobImage_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "UGCGenerationJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UGCGenerationJobImage_productImageId_fkey" FOREIGN KEY ("productImageId") REFERENCES "UGCProductImage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UGCGenerationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationJobId" TEXT NOT NULL,
    "creativeVariants" JSONB NOT NULL,
    "imageResultReferences" JSONB NOT NULL,
    "hookSuggestions" JSONB NOT NULL,
    "shortCopySuggestions" JSONB NOT NULL,
    "ctaSuggestions" JSONB NOT NULL,
    "placementFormats" JSONB NOT NULL,
    "disclosureFlags" JSONB NOT NULL,
    "safetyMetadata" JSONB NOT NULL,
    "rawProviderResponse" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UGCGenerationResult_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "UGCGenerationJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UGCProductImage_projectId_createdAt_idx" ON "UGCProductImage"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UGCGenerationJob_projectId_createdAt_idx" ON "UGCGenerationJob"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "UGCGenerationJobImage_productImageId_idx" ON "UGCGenerationJobImage"("productImageId");

-- CreateIndex
CREATE UNIQUE INDEX "UGCGenerationResult_generationJobId_key" ON "UGCGenerationResult"("generationJobId");
