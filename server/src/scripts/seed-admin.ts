import mongoose from "mongoose";
import { env } from "../config/env.js";
import { UserModel } from "../models/User.js";
import { hashPassword } from "../utils/password.js";

async function main(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);

  const email = env.ADMIN_EMAIL;
  const password = env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ Configura ADMIN_EMAIL y ADMIN_PASSWORD en el .env");
    process.exit(1);
  }

  const existing = await UserModel.findOne({ email });

  if (existing) {
    if (existing.role !== "SUPER_ADMIN") {
      console.error(`❌ El email ${email} ya existe pero no es SUPER_ADMIN`);
      process.exit(1);
    }
    console.log(`El admin ya existe: ${email}`);
  } else {
    const passwordHash = await hashPassword(password);
    await UserModel.create({
      email,
      passwordHash,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      emailVerified: true,
    });
    console.log(`✅ Admin creado: ${email}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Error en el seed:", err);
  process.exit(1);
});
