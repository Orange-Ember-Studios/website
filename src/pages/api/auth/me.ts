import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth';

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get('admin_token')?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    user: { userId: decoded.userId, username: decoded.username }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
