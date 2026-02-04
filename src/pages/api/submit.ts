import type { APIRoute } from "astro";
import { validateQuizPayload } from "../../utils/submit";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = validateQuizPayload(body);
    if (!validation.ok) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        {
          status: validation.status,
          headers: jsonHeaders,
        }
      );
    }
    if (validation.skipped) {
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: jsonHeaders,
      });
    }
    const { payload } = validation;
    if (!payload) {
      return new Response(JSON.stringify({ success: false, error: "Invalid data" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }
    const { answers, userInfo, results } = payload;

    const n8nWebhookUrl = import.meta.env.N8N_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "Webhook not configured" }),
        {
          status: 500,
          headers: jsonHeaders,
        }
      );
    }

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        answers,
        userInfo,
        results,
        timestamp: new Date().toISOString(),
        source: "codariq_quiz",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send to n8n");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error) {
    void error;
    return new Response(JSON.stringify({ success: false, error: "Failed to submit quiz" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: jsonHeaders,
  });
};
