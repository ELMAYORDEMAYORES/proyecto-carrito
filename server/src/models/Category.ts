import mongoose, { InferSchemaType, Schema } from "mongoose";

const categorySchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

categorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export type Category = InferSchemaType<typeof categorySchema>;
export const CategoryModel = mongoose.model("Category", categorySchema);
