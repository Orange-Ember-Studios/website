import { createClient } from '@libsql/client';
import "dotenv/config";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  const res = await db.execute("SELECT p.slug, t.lang, t.content FROM posts p JOIN post_translations t ON p.id = t.post_id WHERE p.type = 'blog'");
  console.log(JSON.stringify(res.rows, null, 2));
}

main().catch(console.error);
