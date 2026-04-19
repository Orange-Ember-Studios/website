import type { APIRoute } from "astro";
import { API_URLS } from "../../constants/urls";
import { EnvManager } from "../../lib/EnvManager";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { name, email, subject, message, token } = data;

    // 1. Server-side validation
    if (!name || !email || !subject || !message || !token) {
      return new Response(
        JSON.stringify({ error: "All fields are required." }),
        { status: 400 },
      );
    }

    // 2. Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address." }), {
        status: 400,
      });
    }

    // 3. Verify Turnstile Token (optional but recommended)

    const result = await fetch(API_URLS.TURNSTILE_VERIFY, {
      method: "POST",
      body: `secret=${EnvManager.TURNSTILE_SECRET_KEY}&response=${token}`,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    const { success } = await result.json();
    if (!success) {
      return new Response(
        JSON.stringify({ error: "Security check failed. Please try again." }),
        { status: 403 },
      );
    }

    // 4. Send Email using Resend
    const resendApiKey = EnvManager.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not defined in environment variables.");
      return new Response(
        JSON.stringify({
          error:
            "Server configuration error. Please contact us via social media.",
        }),
        { status: 500 },
      );
    }

    const resendResponse = await fetch(API_URLS.RESEND_EMAILS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Orange Ember Studios <contact@orangeember.com>",
        to: "hello@orangeember.com",
        reply_to: email, // This allows the recipient to reply directly to the user who filled the form
        subject: `[Contact Form] ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ff5b0d;">New Inquiry from ${name}</h2>
            <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API Error:", resendResult);
      throw new Error(
        resendResult.message || "Failed to send email via Resend",
      );
    }

    console.log("Email sent successfully via Resend to hello@orangeember.com");

    return new Response(
      JSON.stringify({ message: "Success! Your message has been sent." }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact API Error:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again later.",
      }),
      { status: 500 },
    );
  }
};
