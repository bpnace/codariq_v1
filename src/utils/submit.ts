import { isValidEmail } from "./validation";

export type QuizSubmissionPayload = {
  answers?: Record<string, unknown>;
  userInfo?: { name?: string; email?: string; phone?: string };
  results?: Record<string, unknown>;
  honeypot?: string;
};

export type QuizPayloadValidation = {
  ok: boolean;
  status: number;
  error?: string;
  skipped?: boolean;
  payload?: {
    answers: Record<string, unknown>;
    userInfo: { name: string; email: string; phone?: string };
    results: Record<string, unknown>;
    honeypot?: string;
  };
};

export function validateQuizPayload(body: unknown): QuizPayloadValidation {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "Invalid payload" };
  }

  const { answers, userInfo, results, honeypot } = body as QuizSubmissionPayload;

  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return { ok: true, status: 200, skipped: true };
  }

  if (!userInfo?.name || !userInfo?.email || !isValidEmail(userInfo.email)) {
    return { ok: false, status: 400, error: "Invalid user info" };
  }

  if (!answers || typeof answers !== "object" || !results || typeof results !== "object") {
    return { ok: false, status: 400, error: "Invalid data" };
  }

  return {
    ok: true,
    status: 200,
    payload: {
      answers,
      userInfo: {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
      },
      results,
      honeypot,
    },
  };
}
