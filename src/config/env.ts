import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.literal("/api/v1").default("/api/v1"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  DEFAULT_USER_ID: z.string().min(1).default("demo-user"),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"),
  CORS_ALLOWED_ORIGIN_SUFFIXES: z.string().default("")
});

function parseCsvList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeOrigin(origin: string): string {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(origin);
  } catch {
    throw new Error(`Invalid CORS origin: "${origin}"`);
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error(`CORS origin must use http or https protocol: "${origin}"`);
  }

  if (parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
    throw new Error(`CORS origin must not include path, query or hash: "${origin}"`);
  }

  return `${parsedUrl.protocol}//${parsedUrl.host}`.toLowerCase();
}

function normalizeOriginSuffix(suffix: string): string {
  return suffix.replace(/^\./, "").trim().toLowerCase();
}

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

let corsAllowedOrigins: string[] = [];
let corsAllowedOriginSuffixes: string[] = [];

try {
  corsAllowedOrigins = parseCsvList(parsedEnv.data.CORS_ALLOWED_ORIGINS).map(normalizeOrigin);
  corsAllowedOriginSuffixes = parseCsvList(parsedEnv.data.CORS_ALLOWED_ORIGIN_SUFFIXES).map(normalizeOriginSuffix);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error("Invalid CORS environment configuration", error instanceof Error ? error.message : error);
  process.exit(1);
}

const hasNonLocalOrigin = corsAllowedOrigins.some((origin) => {
  const hostname = new URL(origin).hostname;
  return hostname !== "localhost" && hostname !== "127.0.0.1";
});

if (parsedEnv.data.NODE_ENV === "production" && !hasNonLocalOrigin && corsAllowedOriginSuffixes.length === 0) {
  // eslint-disable-next-line no-console
  console.error(
    "Invalid CORS environment configuration",
    "In production set CORS_ALLOWED_ORIGINS and/or CORS_ALLOWED_ORIGIN_SUFFIXES with real frontend domains"
  );
  process.exit(1);
}

export const env = {
  ...parsedEnv.data,
  CORS_ALLOWED_ORIGINS: corsAllowedOrigins,
  CORS_ALLOWED_ORIGIN_SUFFIXES: corsAllowedOriginSuffixes
};
