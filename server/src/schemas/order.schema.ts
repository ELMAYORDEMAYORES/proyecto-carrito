import { z } from "zod";
import { ORDER_STATUSES } from "../models/Order.js";

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
