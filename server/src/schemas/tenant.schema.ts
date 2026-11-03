import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Email inválido"
  );

export const updateTenantSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{3,40}$/, "Slug inválido")
    .optional(),
  description: z.string().trim().max(2000).optional(),
  slogan: z.string().trim().max(200).optional(),
  email: emailField.optional(),
  phone: z.string().trim().max(50).optional(),
  address: z.string().trim().max(200).optional(),
  config: z
    .object({
      showPhone: z.boolean(),
      showAddress: z.boolean(),
      showEmail: z.boolean(),
      showDescription: z.boolean(),
      showSlogan: z.boolean(),
    })
    .partial()
    .optional(),
});

export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
