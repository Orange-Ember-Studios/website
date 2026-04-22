import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getDbClient } from '../src/lib/db';

const BASE_URL = 'https://github.com/Orange-Ember-Studios/website/raw/bfc02708c0c2b15266c77fdeec89df15414fd770/src/content/blog';
const POSTS = [
  'astro-islands',
  'creating-inverse-pulse',
  'exact-slice-accuracy',
  'future-of-gaming',
  'micro-interactions-godot',
  'the-birth-of-orange-ember'
];

async function fetchRaw(url: string) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  // Remove frontmatter
  return text.replace(/^---[\s\S]*?---\s*/, '').trim();
}

async function restore() {
  const db = getDbClient();

  for (const slug of POSTS) {
    console.log(`Restoring ${slug}...`);
    
    const en = await fetchRaw(`${BASE_URL}/${slug}.mdx`);
    const es = await fetchRaw(`${BASE_URL}/es/${slug}.mdx`);
    const fr = await fetchRaw(`${BASE_URL}/fr/${slug}.mdx`);

    const postRes = await db.execute({ sql: 'SELECT id FROM posts WHERE slug = ?', args: [slug] });
    if (postRes.rows.length === 0) {
      console.warn(`Post with slug ${slug} not found in DB.`);
      continue;
    }
    const postId = postRes.rows[0].id;

    if (en) await db.execute({ sql: "UPDATE post_translations SET content = ? WHERE post_id = ? AND lang = 'en'", args: [en, postId] });
    if (es) await db.execute({ sql: "UPDATE post_translations SET content = ? WHERE post_id = ? AND lang = 'es'", args: [es, postId] });
    if (fr) await db.execute({ sql: "UPDATE post_translations SET content = ? WHERE post_id = ? AND lang = 'fr'", args: [fr, postId] });

    console.log(`✓ ${slug} restored.`);
  }
}

restore().catch(console.error);
