import { describe, expect, it } from "vitest";
import { calculateResults, isStepValid } from "../utils/quiz";
import { validateQuizPayload } from "../utils/submit";

describe("calculateResults", () => {
  it("returns high potential when a frequent agent use case is controlled", () => {
    const answers = {
      q1_task_area: "email_requests",
      q2_frequency: "daily",
      q3_agent_permission: "act_after_approval",
      q4_data_systems: ["email", "customer_data"],
      q5_current_ai_use: "logged_processes",
      q6_goal: "test_agent",
    };

    const results = calculateResults(answers);

    expect(results.automationPotential).toBe(86);
    expect(results.level).toBe("Agent lohnt sich");
    expect(results.outcomeTitle).toBe("Ein Agent kann spürbar entlasten");
    expect(results.timeSavingsPotential).toBe(8);
    expect(results.roiEstimate).toBe(1760);
    expect(results.productFit).toBe("implementation");
    expect(results.auditSignal).toBe("mittel");
    expect(results.dimensions).toMatchObject({
      kiNeedScore: 87,
      agentReliefScore: 90,
      complianceReadinessScore: 76,
    });
    expect(results.recommendations.length).toBe(3);
    expect(
      results.recommendations.some((rec) =>
        rec.title.includes("Anfragen vorsortieren"),
      ),
    ).toBe(true);
  });

  it("prioritizes audit when sensitive data and unmanaged AI use meet tool writes", () => {
    const answers = {
      q1_task_area: "documents_invoices",
      q2_frequency: "daily",
      q3_agent_permission: "update_tools",
      q4_data_systems: ["finance", "people_data"],
      q5_current_ai_use: "employees_free",
      q6_goal: "save_time",
    };

    const results = calculateResults(answers);

    expect(results.auditSignal).toBe("hoch");
    expect(results.level).toBe("Prüfen");
    expect(results.outcomeTitle).toBe("Erst Risiko- und Datencheck");
    expect(results.productFit).toBe("audit");
    expect(
      results.recommendations.some((rec) => rec.title.includes("Ablauf-Audit")),
    ).toBe(true);
  });

  it("returns orientation when the task is rare and low-permission", () => {
    const answers = {
      q1_task_area: "unclear",
      q2_frequency: "rarely",
      q3_agent_permission: "summarize",
      q4_data_systems: ["calendar"],
      q5_current_ai_use: "none",
    };

    const results = calculateResults(answers);

    expect(results.automationPotential).toBe(44);
    expect(results.level).toBe("Orientierung");
    expect(results.outcomeTitle).toBe("Noch kein klarer Agentenfall");
    expect(results.timeSavingsPotential).toBe(1);
    expect(results.roiEstimate).toBe(220);
    expect(results.productFit).toBe("orientation");
    expect(
      results.recommendations.some((rec) =>
        rec.title.includes("richtigen Aufgabenraum"),
      ),
    ).toBe(true);
  });
});

describe("isStepValid", () => {
  const baseState = {
    answers: {},
    userInfo: {
      name: "",
      company: "",
      email: "",
      phone: "",
      consent: false,
    },
  };

  it("validates multiple choice steps", () => {
    const step = { id: "q5_use_cases", type: "multiple_choice" };
    expect(isStepValid(step, baseState)).toBe(false);
    expect(
      isStepValid(step, {
        ...baseState,
        answers: { q5_use_cases: ["marketing"] },
      }),
    ).toBe(true);
  });

  it("validates name capture steps", () => {
    const step = { id: "capture_name", type: "name_capture" };
    expect(isStepValid(step, baseState)).toBe(false);
    expect(
      isStepValid(step, {
        ...baseState,
        userInfo: { ...baseState.userInfo, name: "Ada" },
      }),
    ).toBe(true);
  });

  it("validates contact capture steps", () => {
    const step = { id: "capture_contact", type: "contact_capture" };
    expect(
      isStepValid(step, {
        ...baseState,
        userInfo: { ...baseState.userInfo, email: "hi@example.com" },
      }),
    ).toBe(false);
    expect(
      isStepValid(step, {
        ...baseState,
        userInfo: {
          ...baseState.userInfo,
          email: "hi@example.com",
          consent: true,
        },
      }),
    ).toBe(true);
  });
});

describe("validateQuizPayload", () => {
  it("rejects invalid payloads", () => {
    const result = validateQuizPayload(null);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toBe("Invalid payload");
  });

  it("short-circuits honeypot payloads", () => {
    const result = validateQuizPayload({ honeypot: "spam" });
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
  });

  it("rejects missing email", () => {
    const result = validateQuizPayload({
      answers: {},
      results: {},
      userInfo: { name: "Test" },
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid user info");
  });

  it("rejects missing quiz data", () => {
    const result = validateQuizPayload({
      userInfo: { name: "Test", email: "test@example.com" },
      results: {},
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Invalid data");
  });

  it("accepts valid payloads without requiring a name", () => {
    const result = validateQuizPayload({
      answers: { q1: "value" },
      results: { automationPotential: 50 },
      userInfo: { email: "test@example.com" },
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.payload?.userInfo.name).toBe("Interessent/in");
  });
});
