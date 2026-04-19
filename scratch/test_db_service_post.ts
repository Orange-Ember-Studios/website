import { createClient } from '@libsql/client';
import "dotenv/config";
import { getPublishedPostBySlug } from '../src/lib/posts.service';

getPublishedPostBySlug('the-birth-of-orange-ember', 'fr').then(post => {
  console.log(JSON.stringify(post, null, 2));
}).catch(console.error);
