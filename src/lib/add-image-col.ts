import { createClient } from '@libsql/client';
import { EnvManager } from './EnvManager';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function alterDb() {
  const url = EnvManager.TURSO_DATABASE_URL;
  const authToken = EnvManager.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error('Missing credentials');

  const client = createClient({ url, authToken });

  console.log('Adding image column to posts table...');
  try {
    await client.execute(`ALTER TABLE posts ADD COLUMN image TEXT`);
    console.log('Column image added successfully.');
  } catch (err: any) {
    if (err.message.includes('duplicate column name')) {
      console.log('Column image already exists.');
    } else {
      console.error(err);
    }
  }
}

alterDb().catch(console.error);
