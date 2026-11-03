import crypto from "node:crypto";
import { ApiError } from "../utils/ApiError.js";
import { TenantModel } from "../models/Tenant.js";
import { ProductModel } from "../models/Product.js";
import { CategoryModel } from "../models/Category.js";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "login",
  "register",
  "logout",
  "dashboard",
  "tienda",
  "catalogo",
  "cart",
  "checkout",
  "static",
  "uploads",
  "health",
  "verify-email",
  "forgot-password",
  "reset-password",
  "me",
  "orders",
  "products",
  "categories",
]);

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSuffix(): string {
  return crypto.randomBytes(2).toString("hex");
}

export async function resolveTenantSlug(
  provided?: string,
  fallbackBase?: string
): Promise<string> {
  if (provided) {
    if (RESERVED_SLUGS.has(provided)) {
      throw ApiError.badRequest("El slug elegido no está permitido");
    }
    const exists = await TenantModel.exists({ slug: provided });
    if (exists) {
      throw ApiError.conflict("Ese slug ya está en uso");
    }
    return provided;
  }

  const base = slugify(fallbackBase ?? "tienda");
  const candidate = base || "tienda";
  if (RESERVED_SLUGS.has(candidate)) {
    return `${candidate}-${randomSuffix()}`;
  }
  const exists = await TenantModel.exists({ slug: candidate });
  if (!exists) {
    return candidate;
  }
  return `${candidate}-${randomSuffix()}`;
}

export async function generateProductSlug(
  tenantId: string,
  name: string
): Promise<string> {
  const base = slugify(name) || "producto";
  let candidate = base;
  let n = 1;

  while (await ProductModel.exists({ tenantId, slug: candidate })) {
    n += 1;
    candidate = `${base}-${n}`;
  }

  return candidate;
}

export async function generateCategorySlug(
  tenantId: string,
  name: string
): Promise<string> {
  const base = slugify(name) || "categoria";
  let candidate = base;
  let n = 1;

  while (await CategoryModel.exists({ tenantId, slug: candidate })) {
    n += 1;
    candidate = `${base}-${n}`;
  }

  return candidate;
}
