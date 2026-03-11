-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProjectInput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "offerName" TEXT NOT NULL,
    "offerDescription" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "painPoints" JSONB NOT NULL,
    "benefits" JSONB NOT NULL,
    "uniqueValueProposition" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "callToAction" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'es',
    "rawWizardData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectInput_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "requestedParts" JSONB NOT NULL,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GenerationJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GenerationStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationJobId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GenerationStep_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LandingMockup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationJobId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subheadline" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "rawData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LandingMockup_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CopyMockup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationJobId" TEXT NOT NULL,
    "adPrimaryText" TEXT NOT NULL,
    "adHeadline" TEXT NOT NULL,
    "adDescription" TEXT NOT NULL,
    "emailSubject" TEXT NOT NULL,
    "emailBody" TEXT NOT NULL,
    "salesScriptHook" TEXT NOT NULL,
    "rawData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CopyMockup_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreativeMockup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "generationJobId" TEXT NOT NULL,
    "concepts" JSONB NOT NULL,
    "visualDirections" JSONB NOT NULL,
    "hooks" JSONB NOT NULL,
    "rawData" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreativeMockup_generationJobId_fkey" FOREIGN KEY ("generationJobId") REFERENCES "GenerationJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Project_ownerId_createdAt_idx" ON "Project"("ownerId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInput_projectId_key" ON "ProjectInput"("projectId");

-- CreateIndex
CREATE INDEX "GenerationJob_projectId_createdAt_idx" ON "GenerationJob"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "GenerationStep_generationJobId_order_idx" ON "GenerationStep"("generationJobId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationStep_generationJobId_key_key" ON "GenerationStep"("generationJobId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "LandingMockup_generationJobId_key" ON "LandingMockup"("generationJobId");

-- CreateIndex
CREATE UNIQUE INDEX "CopyMockup_generationJobId_key" ON "CopyMockup"("generationJobId");

-- CreateIndex
CREATE UNIQUE INDEX "CreativeMockup_generationJobId_key" ON "CreativeMockup"("generationJobId");
