import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

function isMongoDuplicateError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === 11000
  );
}

function isMulterError(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name?: unknown }).name === "MulterError" &&
    "code" in err
  );
}

const MULTER_ERROR_MESSAGES: Record<string, string> = {
  LIMIT_FILE_SIZE: "La imagen excede el tamaño máximo permitido (2MB)",
  LIMIT_FILE_COUNT: "Demasiadas imágenes en una sola carga",
  LIMIT_UNEXPECTED_FILE: "Campo de archivo inesperado",
};

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (isMongoDuplicateError(err)) {
    res.status(409).json({ message: "Ya existe un registro con esos datos" });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (isMulterError(err)) {
    res.status(400).json({
      message: MULTER_ERROR_MESSAGES[err.code] ?? "Error al subir el archivo",
    });
    return;
  }

  console.error("❌ Error no controlado:", err);

  const message =
    env.NODE_ENV === "production"
      ? "Error interno del servidor"
      : err instanceof Error
        ? err.message
        : "Error interno del servidor";

  res.status(500).json({ message });
}
