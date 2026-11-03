import mongoose, { InferSchemaType, Schema } from "mongoose";

const loginAttemptSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

loginAttemptSchema.index({ email: 1 });
loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

export type LoginAttempt = InferSchemaType<typeof loginAttemptSchema>;
export const LoginAttemptModel = mongoose.model("LoginAttempt", loginAttemptSchema);
