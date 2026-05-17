import "dotenv/config";
import { startServer } from "./app.controller";

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
