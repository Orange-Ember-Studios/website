import type { APIRoute } from 'astro';
import { loginUser } from '../../../lib/auth.service';
import { EnvManager } from '../../../lib/EnvManager';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Missing username or password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authData = await loginUser(username, password);

    if (!authData) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    cookies.set('admin_token', authData.token, {
      path: '/',
      httpOnly: true,
      secure: EnvManager.IS_PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    });

    return new Response(JSON.stringify({
      success: true,
      user: { username: authData.username, id: authData.userId }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
