import { z } from "zod";
import { toCents } from "../utils/money.js";

const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;

const priceToCents = z.coerce
  .number()
  .min(0, "El precio no puede ser negativo")
  .max(999999999, "El precio es demasiado alto")
  .transform(toCents);

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(200),
  description: z.string().trim().max(5000).optional().default(""),
  price: priceToCents,
  categoryId: z.string().nullable().optional(),
  trackInventory: z.boolean().optional().default(false),
  stock: z.number().int().min(0, "El stock no puede ser negativo").optional().default(0),
  status: z.enum(PRODUCT_STATUSES).optional().default("ACTIVE"),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  price: priceToCents.optional(),
  categoryId: z.string().nullable().optional(),
  trackInventory: z.boolean().optional(),
  stock: z.number().int().min(0, "El stock no puede ser negativo").optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
