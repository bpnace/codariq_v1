import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, timestamp, userAgent } = await request.json();

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
        body: {
          email,
          timestamp,
          userAgent,
        },
      }),
    });

    const responseData = await response.text();
    return new Response(responseData, { status: response.status });
  } catch (error) {
    console.error('Waitlist API error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
    });
  }
};
