import mongoose, { InferSchemaType, Schema } from "mongoose";

export const EMAIL_TOKEN_TYPES = ["VERIFY", "RESET"] as const;
export type EmailTokenType = (typeof EMAIL_TOKEN_TYPES)[number];

const emailTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    type: { type: String, enum: [...EMAIL_TOKEN_TYPES], required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

emailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailTokenSchema.index({ userId: 1 });

export type EmailToken = InferSchemaType<typeof emailTokenSchema>;
export const EmailTokenModel = mongoose.model("EmailToken", emailTokenSchema);
