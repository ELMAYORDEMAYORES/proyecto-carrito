import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";
import type { UserRole } from "../models/User.js";

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.role || !roles.includes(req.role)) {
      next(ApiError.forbidden());
      return;
    }
    next();
  };
}
