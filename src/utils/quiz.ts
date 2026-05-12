export type QuizAnswers = Record<string, unknown>;

export type QuizUserInfo = {
  name: string;
  company: string;
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
  optional?: boolean;
};

export type QuizRecommendation = {
  title: string;
  description: string;
  icon: string;
  priority: number;
};

export type QuizAuditSignal = "niedrig" | "mittel" | "hoch";

export type QuizDimensions = {
  kiNeedScore: number;
  agentReliefScore: number;
  complianceReadinessScore: number;
};

export type QuizResults = {
  automationPotential: number;
  level: string;
  outcomeTitle: string;
  outcomeSummary: string;
  timeSavingsPotential: number;
  roiEstimate: number;
  recommendations: QuizRecommendation[];
  productFit: string;
  urgencyScore: number;
  dimensions: QuizDimensions;
  auditSignal: QuizAuditSignal;
  affectedDataClasses: string[];
  agentPermissionLevel: string;
  nextStep: string;
};

export function isStepValid(step: QuizStep, state: QuizState): boolean {
  if (!step) return false;
  if (step.optional) return true;
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
  const taskAreaScores: Record<string, number> = {
    email_requests: 82,
    documents_invoices: 76,
    crm_leads: 78,
    reporting_data: 72,
    handoffs: 84,
    unclear: 42,
  };
  const frequencyScores: Record<string, number> = {
    daily: 94,
    several_weekly: 78,
    weekly: 58,
    rarely: 28,
    unknown: 46,
  };
  const permissionScores: Record<string, number> = {
    summarize: 42,
    prepare: 60,
    draft: 72,
    update_tools: 84,
    act_after_approval: 90,
  };
  const aiUseScores: Record<string, number> = {
    none: 68,
    employees_free: 24,
    rules_no_review: 42,
    approved_tools: 72,
    logged_processes: 88,
    unknown: 40,
  };
  const goalScores: Record<string, number> = {
    save_time: 76,
    fewer_errors: 70,
    faster_replies: 72,
    better_overview: 66,
    clean_rules: 58,
    test_agent: 82,
  };

  const taskArea =
    typeof answers["q1_task_area"] === "string" ? answers["q1_task_area"] : "";
  const frequency =
    typeof answers["q2_frequency"] === "string" ? answers["q2_frequency"] : "";
  const permission =
    typeof answers["q3_agent_permission"] === "string"
      ? answers["q3_agent_permission"]
      : "";
  const aiUse =
    typeof answers["q5_current_ai_use"] === "string"
      ? answers["q5_current_ai_use"]
      : "unknown";
  const goal = typeof answers["q6_goal"] === "string" ? answers["q6_goal"] : "";
  const dataSystems = Array.isArray(answers["q4_data_systems"])
    ? answers["q4_data_systems"].filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const sensitiveData = dataSystems.some((item) =>
    [
      "customer_data",
      "contracts",
      "finance",
      "people_data",
      "internal_knowledge",
    ].includes(item),
  );
  const unclearData = dataSystems.includes("unknown");
  const riskyAiUse = ["employees_free", "rules_no_review", "unknown"].includes(
    aiUse,
  );
  const highPermission = ["update_tools", "act_after_approval"].includes(
    permission,
  );

  const taskScore = taskAreaScores[taskArea] || 45;
  const frequencyScore = frequencyScores[frequency] || 46;
  const permissionScore = permissionScores[permission] || 42;
  const aiUseScore = aiUseScores[aiUse] || 40;
  const goalScore = goal ? goalScores[goal] || 62 : 62;
  const dataPenalty = sensitiveData ? 12 : unclearData ? 16 : 0;

  const kiNeedScore = Math.round(
    taskScore * 0.35 + frequencyScore * 0.45 + goalScore * 0.2,
  );
  const agentReliefScore = Math.round(
    permissionScore * 0.48 + frequencyScore * 0.34 + taskScore * 0.18,
  );
  const complianceReadinessScore = Math.max(
    10,
    Math.round(
      aiUseScore - dataPenalty - (highPermission && riskyAiUse ? 12 : 0),
    ),
  );
  const automationPotential = Math.round(
    kiNeedScore * 0.42 +
      agentReliefScore * 0.38 +
      complianceReadinessScore * 0.2,
  );

  let auditSignal: QuizAuditSignal = "niedrig";
  if (
    (sensitiveData && riskyAiUse) ||
    (highPermission && riskyAiUse) ||
    unclearData
  ) {
    auditSignal = "hoch";
  } else if (sensitiveData || highPermission || riskyAiUse) {
    auditSignal = "mittel";
  }

  const hoursLookup: Record<string, number> = {
    daily: 10,
    several_weekly: 6,
    weekly: 3,
    rarely: 1,
    unknown: 3,
  };
  const permissionMultiplier = highPermission
    ? 0.8
    : permission === "draft"
      ? 0.68
      : 0.55;
  const timeSavingsPotential = Math.max(
    1,
    Math.round((hoursLookup[frequency] || 3) * permissionMultiplier),
  );
  const roiEstimate = Math.round(timeSavingsPotential * 55 * 4);

  let level = "Orientierung";
  let outcomeTitle = "Noch kein klarer Agentenfall";
  let outcomeSummary =
    "Der Ablauf muss zuerst genauer gefasst werden, bevor ein Agent sinnvoll geplant werden kann.";
  let nextStep = "Aufgabenraum finden";

  if (auditSignal === "hoch") {
    level = "Prüfen";
    outcomeTitle = "Erst Risiko- und Datencheck";
    outcomeSummary =
      "Potenzial ist erkennbar, aber Daten, Freigaben und heutige KI-Nutzung müssen vor einem Agenten sauber geprüft werden.";
    nextStep = "Ablauf-Audit";
  } else if (agentReliefScore >= 78 && kiNeedScore >= 70) {
    level = "Agent lohnt sich";
    outcomeTitle = "Ein Agent kann spürbar entlasten";
    outcomeSummary =
      "Der Ablauf wiederholt sich oft genug und hat genug Handlungsspielraum für einen kontrollierten Agenten mit Freigaben.";
    nextStep = "Agenten-Workflow prüfen";
  } else if (agentReliefScore >= 60) {
    level = "Vorbereitung";
    outcomeTitle = "Ein Agent kann Arbeit vorbereiten";
    outcomeSummary =
      "Ein Agent sollte hier zunächst sortieren, Entwürfe bauen oder Übergaben vorbereiten, bevor er tiefer in Tools eingreift.";
    nextStep = "Ersten Testfall abgrenzen";
  } else if (kiNeedScore >= 55) {
    level = "Workflow";
    outcomeTitle = "Automatisierung sinnvoll, Agent später";
    outcomeSummary =
      "Der Ablauf bremst, aber ein klarer Workflow kann wahrscheinlich mehr helfen als sofort ein eigenständiger Agent.";
    nextStep = "Workflow prüfen";
  }

  const productFit =
    auditSignal === "hoch"
      ? "audit"
      : determineProductFit(goal, automationPotential);
  const recommendations = generateRecommendations(answers, {
    auditSignal,
    totalScore: automationPotential,
    agentReliefScore,
  });

  return {
    automationPotential,
    level,
    outcomeTitle,
    outcomeSummary,
    timeSavingsPotential,
    roiEstimate,
    recommendations,
    productFit,
    urgencyScore: frequencyScore,
    dimensions: {
      kiNeedScore,
      agentReliefScore,
      complianceReadinessScore,
    },
    auditSignal,
    affectedDataClasses: dataSystems,
    agentPermissionLevel: permission || "unknown",
    nextStep,
  };
}

function determineProductFit(goalAnswer: string, totalScore: number): string {
  if (goalAnswer === "test_agent" && totalScore >= 70) return "implementation";
  if (goalAnswer === "clean_rules") return "audit";
  if (totalScore >= 70) return "audit";
  if (totalScore >= 55) return "workshop";
  return "orientation";
}

type RecommendationContext = {
  auditSignal: QuizAuditSignal;
  totalScore: number;
  agentReliefScore: number;
};

function generateRecommendations(
  answers: QuizAnswers,
  context: RecommendationContext,
): QuizRecommendation[] {
  const recommendations: QuizRecommendation[] = [];
  const dataSystems = Array.isArray(answers["q4_data_systems"])
    ? answers["q4_data_systems"].filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const taskArea =
    typeof answers["q1_task_area"] === "string" ? answers["q1_task_area"] : "";
  const permission =
    typeof answers["q3_agent_permission"] === "string"
      ? answers["q3_agent_permission"]
      : "";
  const aiUse =
    typeof answers["q5_current_ai_use"] === "string"
      ? answers["q5_current_ai_use"]
      : "";

  if (context.auditSignal === "hoch") {
    recommendations.push({
      title: "Ablauf-Audit vor dem ersten Agenten",
      description:
        "Prüfe Datenquellen, Rollen, Freigaben, Anbieter, Protokolle und Stopppunkte, bevor ein Agent produktiv arbeitet.",
      icon: "Audit",
      priority: 12,
    });
  }

  if (taskArea === "email_requests") {
    recommendations.push({
      title: "Anfragen vorsortieren und Antworten vorbereiten",
      description:
        "Ein Agent kann E-Mails bündeln, Kontext suchen und Antwortentwürfe bauen, während Versand und Sonderfälle kontrolliert bleiben.",
      icon: "Mail",
      priority: 10,
    });
  }

  if (taskArea === "documents_invoices") {
    recommendations.push({
      title: "Dokumente und Belege mit Prüfspur vorbereiten",
      description:
        "Belege, Verträge oder PDFs lassen sich auslesen, sortieren und für Buchhaltung oder Rückfragen vorbereiten.",
      icon: "Docs",
      priority: 10,
    });
  }

  if (taskArea === "crm_leads") {
    recommendations.push({
      title: "Lead- und CRM-Arbeit als kontrollierten Ablauf testen",
      description:
        "Ein Agent kann Recherche, Gesprächsnotizen und nächste Schritte vorbereiten, ohne eigenständig Zusagen zu machen.",
      icon: "CRM",
      priority: 10,
    });
  }

  if (taskArea === "reporting_data") {
    recommendations.push({
      title: "Reporting aus Datenquellen stabilisieren",
      description:
        "Wiederkehrende Status, Zahlen und offene Punkte sollten erst verlässlich gesammelt und dann kommentiert werden.",
      icon: "Data",
      priority: 9,
    });
  }

  if (taskArea === "handoffs") {
    recommendations.push({
      title: "Übergaben und Entscheidungspunkte sichtbar machen",
      description:
        "Ein Agent kann offene Punkte, Zuständigkeiten und fehlende Informationen bündeln, bevor jemand nachfragen muss.",
      icon: "Flow",
      priority: 10,
    });
  }

  if (taskArea === "unclear") {
    recommendations.push({
      title: "Erst den richtigen Aufgabenraum finden",
      description:
        "Wenn der stärkste Hebel noch unklar ist, lohnt sich eine kurze Prozessprüfung vor Tool- oder Agentenentscheidungen.",
      icon: "Scope",
      priority: 9,
    });
  }

  if (["update_tools", "act_after_approval"].includes(permission)) {
    recommendations.push({
      title: "Freigaben festlegen, bevor der Agent in Tools schreibt",
      description:
        "Sobald ein Agent Daten ändert oder Aktionen vorbereitet, braucht er Rollen, Stopps, Protokolle und klare Zuständigkeiten.",
      icon: "Rules",
      priority: 8,
    });
  }

  if (
    dataSystems.some((item) =>
      ["customer_data", "contracts", "finance", "people_data"].includes(item),
    )
  ) {
    recommendations.push({
      title: "DSGVO- und EU-AI-Act-Vorprüfung einplanen",
      description:
        "Bei Kunden-, Finanz-, Vertrags- oder Personaldaten muss vor dem Betrieb geklärt werden, wer was verarbeitet und kontrolliert.",
      icon: "Law",
      priority: 9,
    });
  }

  if (aiUse === "employees_free" || aiUse === "rules_no_review") {
    recommendations.push({
      title: "Bestehende KI-Nutzung sauber einhegen",
      description:
        "Wenn Mitarbeitende KI bereits nutzen, sollten Tools, Datenarten, Freigaben und Nachweise zuerst geordnet werden.",
      icon: "AI",
      priority: 8,
    });
  }

  if (context.agentReliefScore >= 72 && context.auditSignal !== "hoch") {
    recommendations.push({
      title: "Ersten Testagenten begrenzt aufsetzen",
      description:
        "Starte mit einem kleinen Ablauf, echten Beispielen, klarer Freigabe und einem Protokoll der Entscheidungen.",
      icon: "Test",
      priority: 8,
    });
  }

  if (recommendations.length === 0 || context.totalScore < 45) {
    recommendations.push({
      title: "KI-Bedarf zuerst sauber einordnen",
      description:
        "Der nächste Schritt ist keine Tool-Auswahl, sondern ein klarer Blick auf Aufwand, Wiederholung, Daten und Entscheidungspunkte.",
      icon: "Check",
      priority: 7,
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3);
}
