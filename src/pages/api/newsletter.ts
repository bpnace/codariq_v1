import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, source, timestamp, userAgent } = await request.json();

    // Server-side: Credentials from environment variables
    const webhookUrl = import.meta.env.WEBHOOK_URL;
    const credentials = btoa(
      `${import.meta.env.WEBHOOK_USER}:${import.meta.env.WEBHOOK_PASS}`
    );

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        email,
        source,
        timestamp,
        userAgent,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Webhook failed' }), {
        status: 500,
      });
    }

    const data = await response.text();
    return new Response(data, { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
    });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
};
