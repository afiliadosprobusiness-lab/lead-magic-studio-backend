import { z } from "zod";

export const projectIdParamSchema = z.object({
  id: z.string().cuid()
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(3).max(120),
  input: z.object({
    offerName: z.string().trim().min(3).max(160),
    offerDescription: z.string().trim().min(10).max(2000),
    targetAudience: z.string().trim().min(5).max(1000),
    painPoints: z.array(z.string().trim().min(2).max(160)).min(1).max(12),
    benefits: z.array(z.string().trim().min(2).max(160)).min(1).max(12),
    uniqueValueProposition: z.string().trim().min(5).max(500),
    tone: z.string().trim().min(2).max(80),
    callToAction: z.string().trim().min(2).max(160),
    language: z.string().trim().min(2).max(10).default("es"),
    rawWizardData: z.record(z.string(), z.unknown()).optional()
  })
});

export const duplicateProjectSchema = z.object({
  name: z.string().trim().min(3).max(120).optional()
});

