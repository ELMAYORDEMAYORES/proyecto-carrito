import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
