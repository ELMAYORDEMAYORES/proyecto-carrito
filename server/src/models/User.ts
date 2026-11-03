import mongoose, { InferSchemaType, Schema } from "mongoose";

export const USER_ROLES = ["SUPER_ADMIN", "OWNER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: [...USER_ROLES], default: "OWNER" },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", default: null },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model("User", userSchema);
