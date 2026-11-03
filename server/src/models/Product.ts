import mongoose, { InferSchemaType, Schema } from "mongoose";

export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

const productSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // centavos
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    categoryName: { type: String, default: "" },
    status: { type: String, enum: [...PRODUCT_STATUSES], default: "ACTIVE" },
    trackInventory: { type: Boolean, default: false },
    stock: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

productSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
productSchema.index({ tenantId: 1, status: 1 });

export type Product = InferSchemaType<typeof productSchema>;
export const ProductModel = mongoose.model("Product", productSchema);
