import { ApiError } from "./ApiError.js";

export function requireTenantId(tenantId: string | undefined): string {
  if (!tenantId) {
    throw ApiError.forbidden("No tienes un negocio asociado a tu cuenta");
  }
  return tenantId;
}

export function getStringParam(value: string | string[] | undefined): string {
  const v = Array.isArray(value) ? value[0] : value;
  return v ?? "";
}

export function getStringQuery(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}
