import type { UserRole } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: UserRole;
      tenantId?: string;
    }
  }
}

export {};
