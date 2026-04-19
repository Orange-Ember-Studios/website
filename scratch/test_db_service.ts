import { createClient } from '@libsql/client';
import "dotenv/config";
import { getPublishedPostsByType } from '../src/lib/posts.service';

getPublishedPostsByType('blog').then(posts => {
  console.log(JSON.stringify(posts, null, 2));
}).catch(console.error);
