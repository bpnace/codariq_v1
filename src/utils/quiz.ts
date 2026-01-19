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
    return state.userInfo.email.trim().length > 0 && Boolean(state.userInfo.consent);
  }
  return Boolean(state.answers[step.id]);
}

export function calculateResults(answers: QuizAnswers): QuizResults {
  const motivationScores = {
    very_motivated: 100,
    motivated: 75,
    low_motivated: 40,
    not_motivated: 10,
  };
  const experienceScores = {
    beginner: 30,
    novice: 50,
    user: 75,
    advanced: 90,
  };
  const timeWasteScores = {
    low: 30,
    medium: 60,
    high: 85,
    critical: 100,
  };
  const budgetScores = {
    free: 20,
    starter: 40,
    learning: 70,
    intensive: 90,
    premium: 100,
  };
  const urgencyScores = {
    asap: 100,
    soon: 70,
    no_rush: 30,
  };

  const motivationKey =
    typeof answers["q3_motivation"] === "string" ? answers["q3_motivation"] : "";
  const experienceKey =
    typeof answers["q4_experience_level"] === "string"
      ? answers["q4_experience_level"]
      : "";
  const timeWasteKey =
    typeof answers["q9_time_waste"] === "string" ? answers["q9_time_waste"] : "";
  const budgetKey =
    typeof answers["q10_budget"] === "string" ? answers["q10_budget"] : "";
  const urgencyKey =
    typeof answers["q7_urgency"] === "string" ? answers["q7_urgency"] : "";

  const motivation = motivationScores[motivationKey] || 50;
  const experience = experienceScores[experienceKey] || 50;
  const timeWaste = timeWasteScores[timeWasteKey] || 50;
  const budget = budgetScores[budgetKey] || 50;
  const urgency = urgencyScores[urgencyKey] || 50;

  const totalScore = Math.round(
    (motivation + experience + timeWaste + budget + urgency) / 5
  );

  const hoursLookup = {
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
  if (goalAnswer === "getting_started" && budgetScore >= 40 && budgetScore < 70) {
    return "starter";
  }
  return "workshop";
}

function generateRecommendations(
  answers: QuizAnswers,
  totalScore: number
): QuizRecommendation[] {
  const recommendations: QuizRecommendation[] = [];
  const useCasesRaw = Array.isArray(answers["q5_use_cases"])
    ? answers["q5_use_cases"]
    : [];
  const useCases = useCasesRaw.filter((item): item is string => typeof item === "string");

  if (useCases.includes("customer_support")) {
    recommendations.push({
      title: "KI-Chatbot für Kundenanfragen",
      description:
        "Automatisiere die Beantwortung häufiger Kundenfragen mit einem intelligenten Chatbot. Spart bis zu 80% der Support-Zeit.",
      icon: "💬",
      priority: 10,
    });
  }

  if (useCases.includes("invoicing")) {
    recommendations.push({
      title: "Automatische Rechnungsstellung",
      description:
        "Erstelle und versende Rechnungen automatisch nach Projektabschluss. Integriert mit deiner Buchhaltungssoftware.",
      icon: "📄",
      priority: 9,
    });
  }

  if (useCases.includes("marketing")) {
    recommendations.push({
      title: "Lead-Generierung automatisieren",
      description:
        "Automatische Lead-Erfassung, Qualifizierung und Follow-up-Kampagnen. Steigere deine Conversion-Rate um 40%.",
      icon: "🎯",
      priority: 8,
    });
  }

  if (useCases.includes("data_automation")) {
    recommendations.push({
      title: "Dashboard und Reporting",
      description:
        "Automatische Datenerfassung und Echtzeit-Dashboards für bessere Entscheidungen.",
      icon: "📊",
      priority: 7,
    });
  }

  const experienceLevel =
    typeof answers["q4_experience_level"] === "string"
      ? answers["q4_experience_level"]
      : "";
  if (experienceLevel === "beginner" || experienceLevel === "novice") {
    recommendations.push({
      title: "Einstiegs-Workshop buchen",
      description:
        "Lerne die Grundlagen der Automatisierung in einem 2-stündigen Hands-on Workshop. Perfekt für Einsteiger.",
      icon: "🎓",
      priority: 10,
    });
  }

  if (experienceLevel === "advanced" && totalScore >= 70) {
    recommendations.push({
      title: "Custom Workflow-Entwicklung",
      description:
        "Maßgeschneiderte Automatisierungslösungen für komplexe Geschäftsprozesse.",
      icon: "⚙️",
      priority: 9,
    });
  }

  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}
