import type { APIRoute } from 'astro';
import { getPostById, updatePost, deletePost } from '../../../../lib/posts.service';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return new Response('Missing ID', { status: 400 });

  try {
    const post = await getPostById(id);
    if (!post) {
      return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) return new Response('Missing ID', { status: 400 });

  try {
    const data = await request.json();
    const updatedPost = await updatePost(id, { 
      slug: data.slug, 
      type: data.type, 
      author: data.author,
      image: data.image
    }, data.translations || []);
    
    return new Response(JSON.stringify(updatedPost), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return new Response('Missing ID', { status: 400 });

  try {
    await deletePost(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
