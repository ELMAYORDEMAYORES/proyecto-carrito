import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server corriendo en http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Error al iniciar el servidor:", err);
  process.exit(1);
});
