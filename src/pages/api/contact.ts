import type { APIRoute } from 'astro';
import { API_URLS } from '../../constants/urls';
import { EnvManager } from '../../lib/EnvManager';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, subject, message, token } = body;

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!token && !EnvManager.IS_DEV) {
      return new Response(JSON.stringify({ error: 'Security check failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (token && !EnvManager.IS_DEV) {
      const turnstileVerify = await fetch(API_URLS.TURNSTILE_VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${EnvManager.TURNSTILE_SECRET_KEY}&response=${token}`,
      });

      const turnstileResult = await turnstileVerify.json();

      if (!turnstileResult.success) {
        return new Response(JSON.stringify({ error: 'Security check failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (!EnvManager.RESEND_API_KEY) {
      console.log('[Contact] Resend API key not configured, skipping email send');
      return new Response(JSON.stringify({ success: true, message: 'Message received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resendResponse = await fetch(API_URLS.RESEND_EMAILS, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EnvManager.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Orange Ember <onboarding@resend.dev>',
        to: 'hello@orangeember.com',
        subject: `[Contact Form] ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      })
    });

    if (!resendResponse.ok) {
      console.error('[Contact] Resend API error:', await resendResponse.text());
      return new Response(JSON.stringify({ error: 'Failed to send message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[Contact] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
