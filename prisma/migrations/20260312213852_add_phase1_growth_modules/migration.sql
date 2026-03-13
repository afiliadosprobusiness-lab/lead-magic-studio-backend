-- CreateTable
CREATE TABLE "GeneratedCopy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sourceTemplateId" TEXT,
    "sourceGenerationJobId" TEXT,
    "objective" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "platform" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "label" TEXT,
    "headline" TEXT NOT NULL,
    "primaryText" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "shortCaption" TEXT NOT NULL,
    "hookVariants" JSONB NOT NULL,
    "rawProviderResponse" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeneratedCopy_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GeneratedCopy_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "CopyTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CopyTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "tone" TEXT,
    "platform" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "templateText" TEXT NOT NULL,
    "ctaDefault" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CopyTemplate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreativePack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT,
    "tone" TEXT,
    "platform" TEXT,
    "notes" TEXT,
    "createdFromCopyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreativePack_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreativePack_createdFromCopyId_fkey" FOREIGN KEY ("createdFromCopyId") REFERENCES "GeneratedCopy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreativePackItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creativePackId" TEXT NOT NULL,
    "generatedCopyId" TEXT,
    "assetType" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "label" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreativePackItem_creativePackId_fkey" FOREIGN KEY ("creativePackId") REFERENCES "CreativePack" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CreativePackItem_generatedCopyId_fkey" FOREIGN KEY ("generatedCopyId") REFERENCES "GeneratedCopy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PublicationDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "selectedCopyId" TEXT,
    "creativePackId" TEXT,
    "selectedAssetRefs" JSONB NOT NULL,
    "captionText" TEXT NOT NULL,
    "finalText" TEXT,
    "ctaText" TEXT,
    "finalUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PublicationDraft_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PublicationDraft_selectedCopyId_fkey" FOREIGN KEY ("selectedCopyId") REFERENCES "GeneratedCopy" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "PublicationDraft_creativePackId_fkey" FOREIGN KEY ("creativePackId") REFERENCES "CreativePack" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectHistoryEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectHistoryEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GeneratedCopy_projectId_createdAt_idx" ON "GeneratedCopy"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "GeneratedCopy_ownerId_createdAt_idx" ON "GeneratedCopy"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CopyTemplate_ownerId_createdAt_idx" ON "CopyTemplate"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CopyTemplate_projectId_createdAt_idx" ON "CopyTemplate"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CreativePack_projectId_createdAt_idx" ON "CreativePack"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CreativePack_ownerId_createdAt_idx" ON "CreativePack"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "CreativePackItem_creativePackId_createdAt_idx" ON "CreativePackItem"("creativePackId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "CreativePackItem_assetType_assetId_idx" ON "CreativePackItem"("assetType", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "CreativePackItem_creativePackId_assetType_assetId_key" ON "CreativePackItem"("creativePackId", "assetType", "assetId");

-- CreateIndex
CREATE INDEX "PublicationDraft_projectId_createdAt_idx" ON "PublicationDraft"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PublicationDraft_ownerId_createdAt_idx" ON "PublicationDraft"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProjectHistoryEvent_projectId_createdAt_idx" ON "ProjectHistoryEvent"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProjectHistoryEvent_ownerId_createdAt_idx" ON "ProjectHistoryEvent"("ownerId", "createdAt" DESC);
