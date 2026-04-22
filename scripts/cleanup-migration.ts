import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getDbClient } from '../src/lib/db';

async function cleanup() {
  const db = getDbClient();
  const res = await db.execute("SELECT id, content FROM post_translations WHERE content LIKE '%[object Object]%'");
  
  console.log(`Encontrados ${res.rows.length} posts con errores de migración.`);

  for (const row of res.rows) {
    const id = row.id;
    const content = row.content as string;
    
    // Reemplazo de seguridad para no dejar [object Object]
    const fixed = content.replace(/\[object Object\]/g, '• (Contenido a revisar)');
    
    await db.execute({
      sql: 'UPDATE post_translations SET content = ? WHERE id = ?',
      args: [fixed, id]
    });
    console.log(`Post ${id} limpiado.`);
  }
}

cleanup().catch(console.error);
