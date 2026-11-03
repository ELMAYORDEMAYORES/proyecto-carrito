import mongoose, { InferSchemaType, Schema } from "mongoose";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true, min: 0 }, // centavos
    quantity: { type: Number, required: true, min: 1 },
    snapshot: {
      name: { type: String, default: "" },
      price: { type: Number, default: 0 },
      imageUrl: { type: String, default: null },
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerPhone: { type: String, default: "" },
    status: { type: String, enum: [...ORDER_STATUSES], default: "PENDING" },
    total: { type: Number, required: true, min: 0 }, // centavos
    notes: { type: String, default: null },
    items: { type: [orderItemSchema], required: true },
  },
  { timestamps: true }
);

orderSchema.index({ tenantId: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, status: 1 });

export type Order = InferSchemaType<typeof orderSchema>;
export const OrderModel = mongoose.model("Order", orderSchema);
