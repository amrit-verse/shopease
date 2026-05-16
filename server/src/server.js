import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDemoData } from "./seed.js";

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Auto-seed when running in demo (in-memory) mode so the preview is usable.
  if (!process.env.MONGO_URI) {
    await seedDemoData({ silent: true });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] listening on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
