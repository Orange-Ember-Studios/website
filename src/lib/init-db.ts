import { EnvManager } from "./EnvManager.ts";
import { ensureDatabaseSchema } from "./db-migrations.ts";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function init() {
  const url = EnvManager.TURSO_DATABASE_URL?.trim() ?? "";
  const authToken = EnvManager.TURSO_AUTH_TOKEN ?? "";

  if (!url) {
    throw new Error("Missing TURSO_DATABASE_URL in .env.local");
  }
  if (!url.startsWith("file:") && !authToken) {
    throw new Error(
      "Missing TURSO_AUTH_TOKEN in .env.local (not required for file: URLs)",
    );
  }

  await ensureDatabaseSchema({
    TURSO_DATABASE_URL: url,
    TURSO_AUTH_TOKEN: authToken,
  });
  console.log("Database initialized successfully.");
}

init().catch(console.error);
