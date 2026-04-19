import { createClient } from '@libsql/client';
import "dotenv/config";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  const res = await db.execute("SELECT content FROM post_translations LIMIT 1");
  const content = res.rows[0].content as string;
  try {
    JSON.parse(content);
    console.log("Parse ok");
  } catch (err: any) {
    console.error("Parse error:", err.message);
  }
}
main();
