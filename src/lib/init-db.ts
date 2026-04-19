import { createClient } from '@libsql/client';
import { hashPassword } from './auth';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import crypto from 'crypto';

async function init() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) throw new Error('Missing credentials in .env.local');

  const client = createClient({ url, authToken });

  console.log('Creating tables...');
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS post_translations (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      published BOOLEAN DEFAULT FALSE,
      FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE,
      UNIQUE(post_id, lang)
    );
  `);

  console.log('Tables verified.');

  const adminRes = await client.execute(`SELECT id FROM users WHERE username = 'admin'`);
  if (adminRes.rows.length === 0) {
    console.log('Creating default admin user...');
    const hash = await hashPassword('admin123'); // Password by default
    await client.execute({
      sql: `INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)`,
      args: [crypto.randomUUID(), 'admin', hash]
    });
    console.log('Admin user created. => admin / admin123');
  }

  console.log('Database initialized successfully.');
}

init().catch(console.error);
