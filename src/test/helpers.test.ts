import { describe, expect, it } from "vitest";
import { calculateResults, isStepValid } from "../utils/quiz";
import { validateQuizPayload } from "../utils/submit";

describe("calculateResults", () => {
  it("returns high potential and product fit for aggressive inputs", () => {
    const answers = {
      q3_motivation: "very_motivated",
      q4_experience_level: "advanced",
      q9_time_waste: "critical",
      q10_budget: "premium",
      q7_urgency: "asap",
      q6_goal: "ready_to_use",
      q5_use_cases: ["customer_support", "invoicing"],
    };

    const results = calculateResults(answers);

    expect(results.automationPotential).toBe(98);
    expect(results.level).toBe("Sehr Hoch");
    expect(results.timeSavingsPotential).toBe(11);
    expect(results.roiEstimate).toBe(2200);
    expect(results.productFit).toBe("premium");
    expect(results.recommendations.length).toBe(3);
    expect(
      results.recommendations.some((rec) => rec.title.includes("KI-Chatbot"))
    ).toBe(true);
  });

  it("returns low potential and workshop fit for conservative inputs", () => {
    const answers = {
      q3_motivation: "low_motivated",
      q4_experience_level: "beginner",
      q9_time_waste: "low",
      q10_budget: "free",
      q7_urgency: "no_rush",
      q6_goal: "getting_started",
      q5_use_cases: [],
    };

    const results = calculateResults(answers);

    expect(results.automationPotential).toBe(30);
    expect(results.level).toBe("Niedrig");
    expect(results.timeSavingsPotential).toBe(1);
    expect(results.roiEstimate).toBe(200);
    expect(results.productFit).toBe("workshop");
    expect(
      results.recommendations.some((rec) =>
        rec.title.includes("Einstiegs-Workshop")
      )
    ).toBe(true);
  });
});

describe("isStepValid", () => {
  const baseState = {
    answers: {},
    userInfo: {
      name: "",
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
      })
    ).toBe(true);
  });

  it("validates name capture steps", () => {
    const step = { id: "capture_name", type: "name_capture" };
    expect(isStepValid(step, baseState)).toBe(false);
    expect(
      isStepValid(step, {
        ...baseState,
        userInfo: { ...baseState.userInfo, name: "Ada" },
      })
    ).toBe(true);
  });

  it("validates contact capture steps", () => {
    const step = { id: "capture_contact", type: "contact_capture" };
    expect(
      isStepValid(step, {
        ...baseState,
        userInfo: { ...baseState.userInfo, email: "hi@example.com" },
      })
    ).toBe(false);
    expect(
      isStepValid(step, {
        ...baseState,
        userInfo: {
          ...baseState.userInfo,
          email: "hi@example.com",
          consent: true,
        },
      })
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

  it("rejects missing user info", () => {
    const result = validateQuizPayload({
      answers: {},
      results: {},
      userInfo: { email: "test@example.com" },
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

  it("accepts valid payloads", () => {
    const result = validateQuizPayload({
      answers: { q1: "value" },
      results: { automationPotential: 50 },
      userInfo: { name: "Test", email: "test@example.com" },
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
  });
});
