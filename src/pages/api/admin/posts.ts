import type { APIRoute } from 'astro';
import { getAllPosts, createPost } from '../../../lib/posts.service';

export const GET: APIRoute = async () => {
  try {
    const posts = await getAllPosts();
    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch posts' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.slug || !data.type || !data.author) {
      return new Response(JSON.stringify({ error: 'Missing slug, type, or author' }), { status: 400 });
    }
    
    // data.translations should be an array of {lang, title, content, published}
    const newPost = await createPost({ 
      slug: data.slug, 
      type: data.type, 
      author: data.author,
      image: data.image 
    }, data.translations || []);
    
    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
