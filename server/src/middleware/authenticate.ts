import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../services/token.service.js";
import { ApiError } from "../utils/ApiError.js";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(ApiError.unauthorized());
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.userId = payload.sub;
    req.role = payload.role;
    req.tenantId = payload.tenantId;
    next();
  } catch {
    next(ApiError.unauthorized("Token inválido o expirado"));
  }
}
