import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, "El nombre es requerido").max(100),
  customerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .max(200),
  customerPhone: z.string().trim().max(50).optional().default(""),
  notes: z.string().trim().max(1000).nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "ID de producto requerido"),
        quantity: z.coerce.number().int().min(1, "Cantidad mínima: 1").max(1000, "Cantidad máxima: 1000"),
      })
    )
    .min(1, "El pedido debe tener al menos un producto")
    .max(100, "Demasiados productos en un solo pedido"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
