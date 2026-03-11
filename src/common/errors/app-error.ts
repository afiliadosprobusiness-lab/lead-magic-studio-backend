export type AppErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: AppErrorCode;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code: AppErrorCode = "INTERNAL_ERROR", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown): AppError {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static notFound(message: string, details?: unknown): AppError {
    return new AppError(message, 404, "NOT_FOUND", details);
  }

  static conflict(message: string, details?: unknown): AppError {
    return new AppError(message, 409, "CONFLICT", details);
  }

  static internal(message = "Unexpected error", details?: unknown): AppError {
    return new AppError(message, 500, "INTERNAL_ERROR", details);
  }
}

