/**
 * Seeds planned blog posts from content/blog/* into the CMS database.
 *
 * Usage:
 *   pnpm seed:blog              # unpublished drafts (default)
 *   pnpm seed:blog -- --publish # mark all translations published
 *
 * Requires TURSO_DATABASE_URL in .env.local (file:./local.db for local dev).
 */
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { seedBlogPostsFromContent } from "../src/lib/seed-blog-content.ts";

dotenv.config({ path: ".env.local" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentRoot = join(__dirname, "../content/blog");

const published = process.argv.includes("--publish");

async function main() {
  const result = await seedBlogPostsFromContent(undefined, {
    contentRoot,
    published,
    updateExisting: true,
  });

  console.log("Blog seed complete.");
  if (result.created.length) console.log("  Created:", result.created.join(", "));
  if (result.updated.length) console.log("  Updated:", result.updated.join(", "));
  if (result.skipped.length) console.log("  Skipped:", result.skipped.join(", "));
  if (!result.created.length && !result.updated.length) {
    console.log("  No changes (empty content dir or all skipped).");
  }
  console.log(
    published
      ? "  Translations are published — add hero images in /admin/blog if needed."
      : "  Translations are drafts — add images in /admin/blog, then publish each language.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
