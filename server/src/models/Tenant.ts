import mongoose, { InferSchemaType, Schema } from "mongoose";

export const TENANT_STATUSES = ["PENDING", "ACTIVE", "REJECTED"] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

const tenantConfigSchema = new Schema(
  {
    showPhone: { type: Boolean, default: true },
    showAddress: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: true },
    showDescription: { type: Boolean, default: true },
    showSlogan: { type: Boolean, default: true },
  },
  { _id: false }
);

const tenantSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    slogan: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    logoUrl: { type: String, default: null },
    bannerUrl: { type: String, default: null },
    status: { type: String, enum: [...TENANT_STATUSES], default: "PENDING" },
    rejectionReason: { type: String, default: null },
    config: { type: tenantConfigSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export type Tenant = InferSchemaType<typeof tenantSchema>;
export const TenantModel = mongoose.model("Tenant", tenantSchema);
