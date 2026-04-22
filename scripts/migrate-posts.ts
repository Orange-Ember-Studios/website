import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getDbClient } from '../src/lib/db';
import { editorJsToMarkdown } from '../src/lib/markdown-migrator';

async function migrate() {
  const db = getDbClient();
  const res = await db.execute('SELECT id, content FROM post_translations');
  
  console.log(`Found ${res.rows.length} translations to migrate.`);

  for (const row of res.rows) {
    const id = row.id;
    const content = row.content as string;

    try {
      const data = JSON.parse(content);
      if (data && typeof data === 'object' && data.blocks) {
        const markdown = editorJsToMarkdown(data.blocks);
        await db.execute({
          sql: 'UPDATE post_translations SET content = ? WHERE id = ?',
          args: [markdown, id]
        });
        console.log(`Migrated translation ${id} to Markdown.`);
      }
    } catch (e) {
      // Not valid JSON or already Markdown, skip
    }
  }
}

migrate().catch(console.error);
