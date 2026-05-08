export type QuizAnswers = Record<string, unknown>;
export type QuizUserInfo = {
  name: string;
  email: string;
  phone: string;
  consent: boolean;
};
export type QuizState = {
  answers: QuizAnswers;
  userInfo: QuizUserInfo;
};
export type QuizStep = {
  id: string;
  type: string;
};
export type QuizRecommendation = {
  title: string;
  description: string;
  icon: string;
  priority: number;
};
export type QuizResults = {
  automationPotential: number;
  level: string;
  timeSavingsPotential: number;
  roiEstimate: number;
  recommendations: QuizRecommendation[];
  productFit: string;
  urgencyScore: number;
};

export function isStepValid(step: QuizStep, state: QuizState): boolean {
  if (!step) return false;
  if (step.type === "multiple_choice") {
    const values = state.answers[step.id];
    return Array.isArray(values) && values.length > 0;
  }
  if (step.type === "name_capture") {
    return state.userInfo.name.trim().length > 0;
  }
  if (step.type === "contact_capture") {
    return (
      state.userInfo.email.trim().length > 0 && Boolean(state.userInfo.consent)
    );
  }
  return Boolean(state.answers[step.id]);
}

export function calculateResults(answers: QuizAnswers): QuizResults {
  const motivationScores: Record<string, number> = {
    very_motivated: 100,
    motivated: 75,
    low_motivated: 40,
    not_motivated: 10,
  };
  const experienceScores: Record<string, number> = {
    beginner: 30,
    novice: 50,
    user: 75,
    advanced: 90,
  };
  const timeWasteScores: Record<string, number> = {
    low: 30,
    medium: 60,
    high: 85,
    critical: 100,
  };
  const budgetScores: Record<string, number> = {
    free: 20,
    starter: 40,
    learning: 70,
    intensive: 90,
    premium: 100,
  };
  const urgencyScores: Record<string, number> = {
    asap: 100,
    soon: 70,
    no_rush: 30,
  };
  const attitudeScores: Record<string, number> = {
    enthusiast: 90,
    convinced: 82,
    neutral: 62,
    skeptical: 58,
  };

  const attitudeKey =
    typeof answers["q1_automation_attitude"] === "string"
      ? answers["q1_automation_attitude"]
      : "";
  const motivationKey =
    typeof answers["q3_motivation"] === "string"
      ? answers["q3_motivation"]
      : "";
  const experienceKey =
    typeof answers["q4_experience_level"] === "string"
      ? answers["q4_experience_level"]
      : "";
  const timeWasteKey =
    typeof answers["q9_time_waste"] === "string"
      ? answers["q9_time_waste"]
      : "";
  const budgetKey =
    typeof answers["q10_budget"] === "string" ? answers["q10_budget"] : "";
  const urgencyKey =
    typeof answers["q7_urgency"] === "string" ? answers["q7_urgency"] : "";

  const motivation = motivationScores[motivationKey] || 50;
  const experience = experienceScores[experienceKey] || 50;
  const timeWaste = timeWasteScores[timeWasteKey] || 50;
  const budget = budgetScores[budgetKey] || 50;
  const urgency = urgencyScores[urgencyKey] || 50;
  const attitude =
    attitudeKey in attitudeScores ? attitudeScores[attitudeKey] : null;

  const scoringInputs = [
    motivation,
    experience,
    timeWaste,
    budget,
    urgency,
    ...(attitude !== null ? [attitude] : []),
  ];
  const totalScore = Math.round(
    scoringInputs.reduce((sum, score) => sum + score, 0) / scoringInputs.length,
  );

  const hoursLookup: Record<string, number> = {
    low: 2,
    medium: 5,
    high: 10,
    critical: 15,
  };
  const hoursPerWeek = hoursLookup[timeWasteKey] || 5;
  const timeSavingsPotential = Math.round(hoursPerWeek * 0.7);
  const roiEstimate = Math.round(timeSavingsPotential * 50 * 4);

  let level = "Niedrig";
  if (totalScore >= 80) level = "Sehr Hoch";
  else if (totalScore >= 60) level = "Hoch";
  else if (totalScore >= 40) level = "Mittel";

  const goalAnswer =
    typeof answers["q6_goal"] === "string" ? answers["q6_goal"] : "";
  const productFit = determineProductFit(goalAnswer, budget);

  const recommendations = generateRecommendations(answers, totalScore);

  return {
    automationPotential: totalScore,
    level,
    timeSavingsPotential,
    roiEstimate,
    recommendations,
    productFit,
    urgencyScore: urgency,
  };
}

function determineProductFit(goalAnswer: string, budgetScore: number): string {
  if (goalAnswer === "ready_to_use" && budgetScore >= 90) {
    return "premium";
  }
  if (goalAnswer === "learn_implement" && budgetScore >= 70) {
    return "intensive";
  }
  if (
    goalAnswer === "getting_started" &&
    budgetScore >= 40 &&
    budgetScore < 70
  ) {
    return "starter";
  }
  return "workshop";
}

function generateRecommendations(
  answers: QuizAnswers,
  totalScore: number,
): QuizRecommendation[] {
  const recommendations: QuizRecommendation[] = [];
  const useCasesRaw = Array.isArray(answers["q5_use_cases"])
    ? answers["q5_use_cases"]
    : [];
  const useCases = useCasesRaw.filter(
    (item): item is string => typeof item === "string",
  );
  const hurdle =
    typeof answers["q2_biggest_hurdle"] === "string"
      ? answers["q2_biggest_hurdle"]
      : "";
  const companyStructure =
    typeof answers["q8_company_structure"] === "string"
      ? answers["q8_company_structure"]
      : "";

  if (hurdle === "getting_started" || hurdle === "exploration") {
    recommendations.push({
      title: "Ersten Aufgabenraum eingrenzen",
      description:
        "Vor dem Tool-Setup klären wir, welcher Ablauf klein genug für den Start ist und wo Freigaben nötig sind.",
      icon: "Scope",
      priority: 9,
    });
  }

  if (hurdle === "team_overwhelmed") {
    recommendations.push({
      title: "Übergaben und Kontextfluss prüfen",
      description:
        "Wir prüfen, wo Informationen zwischen Tools, Rollen und Entscheidungen verloren gehen und was ein Agent vorbereiten darf.",
      icon: "Team",
      priority: 9,
    });
  }

  if (hurdle === "competition" || hurdle === "time_waste") {
    recommendations.push({
      title: "Routinen mit klarer Übergabe entlasten",
      description:
        "Wiederkehrende Arbeit wird zuerst als vorbereitender Workflow gebaut, mit Stopp vor kritischen Aktionen.",
      icon: "Ops",
      priority: 8,
    });
  }

  if (useCases.includes("customer_support")) {
    recommendations.push({
      title: "Support-Agent für Kundenanfragen",
      description:
        "Ein kontrollierbarer KI-Agent sortiert Anfragen, bereitet Antworten vor und markiert Fälle, die ein Mensch prüfen sollte.",
      icon: "Support",
      priority: 10,
    });
  }

  if (useCases.includes("invoicing")) {
    recommendations.push({
      title: "Backoffice-Agent für Rechnungen und Dokumente",
      description:
        "Dokumente werden ausgelesen, sauber abgelegt und für Buchhaltung oder Rückfragen vorbereitet.",
      icon: "Docs",
      priority: 9,
    });
  }

  if (useCases.includes("marketing")) {
    recommendations.push({
      title: "Vertriebs-Agent für Leads und Follow-ups",
      description:
        "Neue Leads werden qualifiziert, im CRM vorbereitet und mit passenden nächsten Schritten versehen.",
      icon: "Sales",
      priority: 8,
    });
  }

  if (useCases.includes("data_automation")) {
    recommendations.push({
      title: "Reporting-Agent für bessere Entscheidungen",
      description:
        "Ein Agent sammelt Status, Zahlen und offene Punkte aus deinen Tools und bereitet eine verständliche Übersicht vor.",
      icon: "Data",
      priority: 7,
    });
  }

  if (
    useCases.includes("process_automation") ||
    useCases.includes("ai_strategy")
  ) {
    recommendations.push({
      title: "KI-Integration in bestehende Systeme prüfen",
      description:
        "Wir prüfen, welche Tools verbunden werden müssen, wo Freigaben nötig sind und welcher Agenten-Workflow zuerst messbar entlastet.",
      icon: "Flow",
      priority: 8,
    });
  }

  const experienceLevel =
    typeof answers["q4_experience_level"] === "string"
      ? answers["q4_experience_level"]
      : "";
  if (experienceLevel === "beginner" || experienceLevel === "novice") {
    recommendations.push({
      title: "Agentenfähigkeit klären",
      description:
        "Starte mit einem klaren Überblick über Prozesse, Daten, Tool-Stack, Risiken und sinnvolle erste Aufgabenräume.",
      icon: "Ready",
      priority: 10,
    });
  }

  if (experienceLevel === "advanced" && totalScore >= 70) {
    recommendations.push({
      title: "Agenten-Workflow entwickeln",
      description:
        "Baue einen kontrollierbaren Agenten-Workflow mit Rollen, Logs, Freigaben und Integration in deine bestehenden Systeme.",
      icon: "Ops",
      priority: 9,
    });
  }

  if (companyStructure === "small_team" || companyStructure === "established") {
    recommendations.push({
      title: "Rollen und Freigaben festlegen",
      description:
        "Bei mehreren Beteiligten braucht der Agent klare Zuständigkeiten, Freigabepunkte und nachvollziehbare Logs.",
      icon: "Roles",
      priority: 8,
    });
  }

  if (companyStructure === "startup") {
    recommendations.push({
      title: "Tool- und Datenbasis stabilisieren",
      description:
        "Wenn Strukturen gerade entstehen, sollte der erste Agent die Datenbasis nicht zusätzlich unübersichtlich machen.",
      icon: "Data",
      priority: 7,
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3);
}
