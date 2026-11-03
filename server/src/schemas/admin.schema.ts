import { z } from "zod";

export const rejectTenantSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "El motivo debe tener al menos 5 caracteres")
    .max(500, "El motivo es demasiado largo"),
});

export type RejectTenantInput = z.infer<typeof rejectTenantSchema>;
