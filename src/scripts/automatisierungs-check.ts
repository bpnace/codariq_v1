import {
  calculateResults,
  isStepValid,
  type QuizResults,
  type QuizState,
} from "../utils/quiz";
import { isValidEmail } from "../utils/validation";

type QuizCard = {
  title: string;
  value: string;
  subtitle?: string;
  emoji?: string;
  icon?: string;
  image?: string;
};

type QuizOption = {
  text: string;
  value: string;
  icon?: string;
};

type BaseStep = {
  id: string;
  question: string;
  subtitle?: string;
  optional?: boolean;
};

type VisualCardStep = BaseStep & {
  type: "visual_cards";
  cards: QuizCard[];
};

type IconOptionStep = BaseStep & {
  type: "icon_options";
  options: QuizOption[];
};

type MultipleChoiceStep = BaseStep & {
  type: "multiple_choice";
  options: QuizOption[];
  maxSelections: number;
};

type NameCaptureStep = BaseStep & {
  type: "name_capture";
};

type ContactCaptureStep = BaseStep & {
  type: "contact_capture";
};

type QuizStep =
  | VisualCardStep
  | IconOptionStep
  | MultipleChoiceStep
  | NameCaptureStep
  | ContactCaptureStep;

type QuizRunState = QuizState & {
  currentStep: number;
};

type QuizElements = {
  stepLabel: HTMLSpanElement;
  progressFill: HTMLDivElement;
  progressPercent: HTMLSpanElement;
  progressMessage: HTMLSpanElement;
  question: HTMLHeadingElement;
  subtitle: HTMLParagraphElement;
  options: HTMLDivElement;
  hint: HTMLParagraphElement;
  back: HTMLButtonElement;
  next: HTMLButtonElement;
  error: HTMLParagraphElement;
  result: HTMLDivElement;
  resultPotential: HTMLSpanElement;
  resultLevel: HTMLSpanElement;
  resultSummary: HTMLParagraphElement;
  resultTime: HTMLSpanElement;
  resultRoi: HTMLSpanElement;
  resultRecommendations: HTMLUListElement;
  quizShell: HTMLDivElement;
};

const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing quiz element: ${id}`);
  }
  return element as T;
};

const quizIconSvg: Record<string, string> = {
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"></path><path d="m4 7 8 6 8-6"></path></svg>',
  docs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h5"></path><path d="M9 13h6"></path><path d="M9 17h4"></path></svg>',
  crm: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M3 21a6 6 0 0 1 12 0"></path><path d="M17 10v6"></path><path d="M14 13h6"></path></svg>',
  data: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16"></path><path d="M7 16V9"></path><path d="M12 16V5"></path><path d="M17 16v-4"></path></svg>',
  handoff:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h7a4 4 0 0 1 4 4v6"></path><path d="m13 14 3 3 3-3"></path><path d="M5 17h5"></path><path d="m8 14 3 3-3 3"></path></svg>',
  question:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 9a3 3 0 1 1 4.6 2.5c-1.1.7-1.8 1.3-1.8 2.5"></path><path d="M12 18h.01"></path><circle cx="12" cy="12" r="9"></circle></svg>',
  daily:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.9 4.9 6.3 6.3"></path><path d="m17.7 17.7 1.4 1.4"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.9 19.1 1.4-1.4"></path><path d="m17.7 6.3 1.4-1.4"></path></svg>',
  repeat:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 2l4 4-4 4"></path><path d="M3 11V9a3 3 0 0 1 3-3h15"></path><path d="m7 22-4-4 4-4"></path><path d="M21 13v2a3 3 0 0 1-3 3H3"></path></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v15H5z"></path><path d="M8 3v4"></path><path d="M16 3v4"></path><path d="M5 10h14"></path><path d="M9 14h.01"></path><path d="M13 14h.01"></path><path d="M17 14h.01"></path></svg>',
  rare: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12"></path><path d="M6 21h12"></path><path d="M8 3c0 5 8 5 8 10s-8 5-8 8"></path><path d="M16 3c0 5-8 5-8 10s8 5 8 8"></path></svg>',
  sort: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16"></path><path d="M7 12h10"></path><path d="M10 18h4"></path></svg>',
  prepare:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h6"></path><path d="M5 12h8"></path><path d="M5 18h5"></path><path d="m15 17 2 2 4-5"></path></svg>',
  draft:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19h4l10-10-4-4L5 15z"></path><path d="m14 6 4 4"></path></svg>',
  update:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="7" ry="3"></ellipse><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"></path><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path></svg>',
  approval:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v6c0 4.3-2.9 7.4-7 9-4.1-1.6-7-4.7-7-9V6z"></path><path d="m9 12 2 2 4-5"></path></svg>',
  none: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="m7 17 10-10"></path></svg>',
  free: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"></path><path d="M18 14l.9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9z"></path></svg>',
  rules:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8l1 2h3v15H4V6h3z"></path><path d="M8 12h5"></path><path d="M8 16h3"></path><path d="m14 16 2 2 4-5"></path></svg>',
  tools:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5 17 4l3 3-2.5 2.5"></path><path d="M4 20l7.5-7.5"></path><path d="M13 5a5 5 0 0 0 6 6L8 22 2 16z"></path></svg>',
  logs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"></path><path d="M15 3v4h4"></path><path d="m8 15 2 2 4-5"></path></svg>',
  time: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path></svg>',
  errors:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v6c0 4.3-2.9 7.4-7 9-4.1-1.6-7-4.7-7-9V6z"></path><path d="m9 12 2 2 4-5"></path></svg>',
  fast: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 10-13h-7z"></path></svg>',
  overview:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  test: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6"></path><path d="M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 18l-5-9V3"></path><path d="M8 16h8"></path></svg>',
  customer:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="M2 20a6 6 0 0 1 12 0"></path><path d="M17 11a2.5 2.5 0 1 0 0-5"></path><path d="M16 15a5 5 0 0 1 6 5"></path></svg>',
  finance:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7z"></path><path d="M9 7h6"></path><path d="M9 11h6"></path><path d="M9 15h4"></path><path d="M15 17h.01"></path></svg>',
  business:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v14H4z"></path><path d="M9 5v14"></path><path d="M15 5v14"></path><path d="M6 9h1"></path><path d="M11 13h2"></path><path d="M17 9h1"></path></svg>',
  people:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a4 4 0 0 1 4 4c0 3-4 5-4 10"></path><path d="M8 7a4 4 0 0 1 8 0"></path><path d="M8 13c0 3 1.6 6 4 8"></path><path d="M16 13c0 2-.7 4-2 6"></path></svg>',
};

const createQuizIcon = (
  iconName: string | undefined,
  className: string,
): HTMLSpanElement => {
  const icon = document.createElement("span");
  icon.className = className;
  icon.setAttribute("aria-hidden", "true");

  const svg = iconName ? quizIconSvg[iconName] : undefined;
  if (svg) {
    icon.innerHTML = svg;
  } else {
    icon.textContent = iconName || "";
  }

  return icon;
};

const init = () => {
  const quizQuestions: Array<
    VisualCardStep | IconOptionStep | MultipleChoiceStep
  > = [
    {
      id: "q1_task_area",
      question: "Wo frisst Arbeit gerade am meisten Zeit?",
      subtitle:
        "Wähle den Bereich, bei dem du zuerst prüfen willst, ob KI oder ein Agent wirklich entlasten kann.",
      type: "icon_options",
      options: [
        {
          icon: "mail",
          text: "E-Mails, Anfragen oder Support vorsortieren",
          value: "email_requests",
        },
        {
          icon: "docs",
          text: "Dokumente, Rechnungen oder Verträge prüfen",
          value: "documents_invoices",
        },
        {
          icon: "crm",
          text: "Leads, CRM oder Follow-ups vorbereiten",
          value: "crm_leads",
        },
        {
          icon: "data",
          text: "Reporting, Listen oder Datenpflege entlasten",
          value: "reporting_data",
        },
        {
          icon: "handoff",
          text: "Übergaben, Freigaben oder interne Rückfragen bündeln",
          value: "handoffs",
        },
        {
          icon: "question",
          text: "Noch unklar. Ich will den passenden Aufgabenraum finden",
          value: "unclear",
        },
      ],
    },
    {
      id: "q2_frequency",
      question: "Wie oft wiederholt sich dieser Ablauf?",
      subtitle:
        "Je häufiger ein Ablauf kommt, desto eher lohnt sich ein kontrollierter Agent statt noch mehr Handarbeit.",
      type: "icon_options",
      options: [
        { icon: "daily", text: "Täglich oder fast täglich", value: "daily" },
        {
          icon: "repeat",
          text: "Mehrmals pro Woche",
          value: "several_weekly",
        },
        { icon: "calendar", text: "Etwa wöchentlich", value: "weekly" },
        {
          icon: "rare",
          text: "Seltener, aber jedes Mal nervig",
          value: "rarely",
        },
        { icon: "question", text: "Schwer einzuschätzen", value: "unknown" },
      ],
    },
    {
      id: "q3_agent_permission",
      question: "Wie viel dürfte ein Agent davon übernehmen?",
      subtitle:
        "Es geht um den erlaubten Handlungsspielraum. Kritische Entscheidungen sollten kontrolliert bleiben.",
      type: "icon_options",
      options: [
        {
          icon: "sort",
          text: "Nur sortieren, zusammenfassen oder markieren",
          value: "summarize",
        },
        {
          icon: "prepare",
          text: "Vorschläge und nächste Schritte vorbereiten",
          value: "prepare",
        },
        {
          icon: "draft",
          text: "Antworten, Notizen oder Dokumente als Entwurf erstellen",
          value: "draft",
        },
        {
          icon: "update",
          text: "Daten in Tools eintragen oder aktualisieren",
          value: "update_tools",
        },
        {
          icon: "approval",
          text: "Aktionen nach menschlicher Freigabe ausführen",
          value: "act_after_approval",
        },
      ],
    },
    {
      id: "q4_data_systems",
      question: "Welche Daten oder Systeme wären betroffen?",
      subtitle:
        "Wähle bis zu vier. Das ist wichtig für DSGVO, EU AI Act, Freigaben und technische Anbindung.",
      type: "multiple_choice",
      maxSelections: 4,
      options: [
        { icon: "mail", text: "E-Mail oder Postfach", value: "email" },
        {
          icon: "customer",
          text: "Kundendaten oder Gesprächsverläufe",
          value: "customer_data",
        },
        {
          icon: "docs",
          text: "Verträge, Angebote, interne Dokumente oder Wissen",
          value: "contracts",
        },
        {
          icon: "finance",
          text: "Buchhaltung, Rechnungen oder Zahlungsdaten",
          value: "finance",
        },
        {
          icon: "business",
          text: "CRM, Ticketsystem, Projekttool oder Kalender",
          value: "business_tools",
        },
        {
          icon: "people",
          text: "Personenbezogene oder sensible Daten",
          value: "people_data",
        },
        {
          icon: "question",
          text: "Ich bin mir nicht sicher",
          value: "unknown",
        },
      ],
    },
    {
      id: "q5_current_ai_use",
      question: "Wie nutzt ihr KI heute schon?",
      subtitle:
        "Optional, aber hilfreich für die Einschätzung, ob DSGVO- und EU-AI-Act-Themen schon sauber angelegt sind.",
      type: "icon_options",
      optional: true,
      options: [
        { icon: "none", text: "Noch gar nicht", value: "none" },
        {
          icon: "free",
          text: "Einzelne Mitarbeitende nutzen Tools frei",
          value: "employees_free",
        },
        {
          icon: "rules",
          text: "Es gibt Regeln, aber noch keine Prüfung",
          value: "rules_no_review",
        },
        {
          icon: "tools",
          text: "Feste Tools, AVV oder interne Standards sind vorhanden",
          value: "approved_tools",
        },
        {
          icon: "logs",
          text: "Produktive KI-Prozesse haben Freigaben und Protokolle",
          value: "logged_processes",
        },
      ],
    },
    {
      id: "q6_goal",
      question: "Was wäre in den nächsten 30 Tagen ein gutes Ergebnis?",
      subtitle:
        "Optional. Die Antwort hilft, deine Auswertung konkreter zu machen.",
      type: "icon_options",
      optional: true,
      options: [
        { icon: "time", text: "Spürbar Zeit sparen", value: "save_time" },
        {
          icon: "errors",
          text: "Weniger Fehler oder Nacharbeit",
          value: "fewer_errors",
        },
        {
          icon: "fast",
          text: "Schneller auf Anfragen reagieren",
          value: "faster_replies",
        },
        {
          icon: "overview",
          text: "Bessere Übersicht über offene Punkte",
          value: "better_overview",
        },
        {
          icon: "rules",
          text: "Saubere KI-Regeln und Freigaben",
          value: "clean_rules",
        },
        {
          icon: "test",
          text: "Einen ersten Agenten begrenzt testen",
          value: "test_agent",
        },
      ],
    },
  ];

  const captureSteps: Array<ContactCaptureStep> = [
    {
      id: "capture_contact",
      question: "Wohin dürfen wir die Auswertung schicken?",
      subtitle:
        "E-Mail und Einwilligung sind Pflicht. Name, Unternehmen und Telefon bleiben optional.",
      type: "contact_capture",
    },
  ];

  const progressMessages: Array<{ at: number; text: string }> = [
    { at: 35, text: "Aufgabenraum steht." },
    { at: 60, text: "Daten- und Freigaberahmen wird klarer." },
    { at: 86, text: "Nur noch E-Mail für die Auswertung." },
  ];

  const steps: QuizStep[] = [...quizQuestions, ...captureSteps];
  const totalSteps = steps.length;
  const storageKey = "codariq_quiz_v3";

  const state: QuizRunState = {
    currentStep: 0,
    answers: {},
    userInfo: {
      name: "",
      company: "",
      email: "",
      phone: "",
      consent: false,
    },
  };

  const elements: QuizElements = {
    stepLabel: getElement<HTMLSpanElement>("quiz-step-label"),
    progressFill: getElement<HTMLDivElement>("quiz-progress-fill"),
    progressPercent: getElement<HTMLSpanElement>("quiz-progress-percent"),
    progressMessage: getElement<HTMLSpanElement>("quiz-progress-message"),
    question: getElement<HTMLHeadingElement>("quiz-question"),
    subtitle: getElement<HTMLParagraphElement>("quiz-subtitle"),
    options: getElement<HTMLDivElement>("quiz-options"),
    hint: getElement<HTMLParagraphElement>("quiz-hint"),
    back: getElement<HTMLButtonElement>("quiz-back"),
    next: getElement<HTMLButtonElement>("quiz-next"),
    error: getElement<HTMLParagraphElement>("quiz-error"),
    result: getElement<HTMLDivElement>("quiz-result"),
    resultPotential: getElement<HTMLSpanElement>("result-potential"),
    resultLevel: getElement<HTMLSpanElement>("result-level"),
    resultSummary: getElement<HTMLParagraphElement>("result-summary"),
    resultTime: getElement<HTMLSpanElement>("result-time"),
    resultRoi: getElement<HTMLSpanElement>("result-roi"),
    resultRecommendations: getElement<HTMLUListElement>(
      "result-recommendations",
    ),
    quizShell: getElement<HTMLDivElement>("quiz-app"),
  };

  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Ignore save errors (e.g., storage unavailable).
    }
  }

  function setError(message: string) {
    elements.error.textContent = message || "";
  }

  function setHint(message: string) {
    elements.hint.textContent = message || "";
  }

  function updateProgress() {
    const percent = Math.round(((state.currentStep + 1) / totalSteps) * 100);
    const current = steps[state.currentStep];
    elements.stepLabel.textContent =
      current?.type === "contact_capture"
        ? "Auswertung per E-Mail"
        : `Frage ${state.currentStep + 1} von ${quizQuestions.length}`;
    elements.progressFill.style.width = `${percent}%`;
    elements.progressPercent.textContent = `${percent}%`;
    const message =
      [...progressMessages]
        .sort((a, b) => a.at - b.at)
        .filter((item) => percent >= item.at)
        .pop()?.text || "";
    elements.progressMessage.textContent = message;
  }

  function clearOptions() {
    elements.options.innerHTML = "";
  }

  function createCard(
    option: QuizCard,
    stepId: string,
    isSelected: boolean,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quiz-card${isSelected ? " is-selected" : ""}`;
    button.dataset.value = option.value;
    button.dataset.step = stepId;
    button.setAttribute("aria-pressed", String(isSelected));

    const media = document.createElement("div");
    media.className = "quiz-card-media";
    if (option.image) {
      media.style.backgroundImage = `url('${option.image}')`;
      media.style.backgroundSize = "cover";
      media.style.backgroundPosition = "center";
    }
    if (option.icon || option.emoji) {
      const icon = createQuizIcon(
        option.icon ?? option.emoji,
        "quiz-card-icon",
      );
      media.appendChild(icon);
    } else {
      const text = document.createElement("span");
      text.textContent = option.title.split(" ")[0];
      media.appendChild(text);
    }
    button.appendChild(media);

    const title = document.createElement("div");
    title.className = "quiz-card-title";
    title.textContent = option.title;
    button.appendChild(title);

    if (option.subtitle) {
      const subtitle = document.createElement("div");
      subtitle.className = "quiz-card-subtitle";
      subtitle.textContent = option.subtitle;
      button.appendChild(subtitle);
    }

    return button;
  }

  function createOption(
    option: QuizOption,
    stepId: string,
    isSelected: boolean,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quiz-option${isSelected ? " is-selected" : ""}`;
    button.dataset.value = option.value;
    button.dataset.step = stepId;
    button.setAttribute("aria-pressed", String(isSelected));

    if (option.icon) {
      button.appendChild(createQuizIcon(option.icon, "quiz-option-icon"));
    }

    const text = document.createElement("span");
    text.className = "quiz-option-text";
    text.textContent = option.text;
    button.appendChild(text);

    return button;
  }

  function createMulti(
    option: QuizOption,
    stepId: string,
    isSelected: boolean,
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quiz-multi${isSelected ? " is-selected" : ""}`;
    button.dataset.value = option.value;
    button.dataset.step = stepId;
    button.setAttribute("aria-pressed", String(isSelected));

    const indicator = document.createElement("span");
    indicator.className = "quiz-multi-indicator";
    indicator.textContent = isSelected ? "✓" : "";
    button.appendChild(indicator);

    if (option.icon) {
      button.appendChild(createQuizIcon(option.icon, "quiz-option-icon"));
    }

    const text = document.createElement("span");
    text.className = "quiz-option-text";
    text.textContent = option.text;
    button.appendChild(text);

    return button;
  }

  function renderInputs(step: NameCaptureStep | ContactCaptureStep) {
    clearOptions();
    elements.options.dataset.layout = step.type;

    if (step.type === "name_capture") {
      const field = document.createElement("div");
      field.className = "quiz-field";
      const label = document.createElement("label");
      label.textContent = "Name";
      label.setAttribute("for", "quiz-name");
      const input = document.createElement("input");
      input.id = "quiz-name";
      input.type = "text";
      input.placeholder = "z.B. Mina";
      input.value = state.userInfo.name;
      input.addEventListener("input", (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        state.userInfo.name = target.value.trim();
        saveState();
        updateNextState();
      });
      field.appendChild(label);
      field.appendChild(input);
      elements.options.appendChild(field);
    }

    if (step.type === "contact_capture") {
      const nameField = document.createElement("div");
      nameField.className = "quiz-field";
      const nameLabel = document.createElement("label");
      nameLabel.textContent = "Name (optional)";
      nameLabel.setAttribute("for", "quiz-name");
      const nameInput = document.createElement("input");
      nameInput.id = "quiz-name";
      nameInput.type = "text";
      nameInput.placeholder = "z.B. Mina";
      nameInput.value = state.userInfo.name;
      nameInput.addEventListener("input", (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        state.userInfo.name = target.value.trim();
        saveState();
      });
      nameField.appendChild(nameLabel);
      nameField.appendChild(nameInput);

      const companyField = document.createElement("div");
      companyField.className = "quiz-field";
      const companyLabel = document.createElement("label");
      companyLabel.textContent = "Unternehmen (optional)";
      companyLabel.setAttribute("for", "quiz-company");
      const companyInput = document.createElement("input");
      companyInput.id = "quiz-company";
      companyInput.type = "text";
      companyInput.placeholder = "z.B. Beispiel GmbH";
      companyInput.value = state.userInfo.company;
      companyInput.addEventListener("input", (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        state.userInfo.company = target.value.trim();
        saveState();
      });
      companyField.appendChild(companyLabel);
      companyField.appendChild(companyInput);

      const emailField = document.createElement("div");
      emailField.className = "quiz-field";
      const emailLabel = document.createElement("label");
      emailLabel.textContent = "E-Mail-Adresse";
      emailLabel.setAttribute("for", "quiz-email");
      const emailInput = document.createElement("input");
      emailInput.id = "quiz-email";
      emailInput.type = "email";
      emailInput.placeholder = "du@unternehmen.de";
      emailInput.value = state.userInfo.email;
      emailInput.addEventListener("input", (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        state.userInfo.email = target.value.trim();
        saveState();
        updateNextState();
      });
      emailField.appendChild(emailLabel);
      emailField.appendChild(emailInput);

      const phoneField = document.createElement("div");
      phoneField.className = "quiz-field";
      const phoneLabel = document.createElement("label");
      phoneLabel.textContent = "Telefon für Rückfragen (optional)";
      phoneLabel.setAttribute("for", "quiz-phone");
      const phoneInput = document.createElement("input");
      phoneInput.id = "quiz-phone";
      phoneInput.type = "tel";
      phoneInput.placeholder = "+49 170 1234567";
      phoneInput.value = state.userInfo.phone;
      phoneInput.addEventListener("input", (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        state.userInfo.phone = target.value.trim();
        saveState();
      });
      phoneField.appendChild(phoneLabel);
      phoneField.appendChild(phoneInput);

      const consentField = document.createElement("label");
      consentField.className = "quiz-consent";
      const consentInput = document.createElement("input");
      consentInput.type = "checkbox";
      consentInput.id = "quiz-consent";
      consentInput.checked = Boolean(state.userInfo.consent);
      consentInput.addEventListener("change", (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        state.userInfo.consent = target.checked;
        saveState();
        updateNextState();
      });
      const consentText = document.createElement("span");
      consentText.innerHTML =
        'Ich bin damit einverstanden, dass CODARIQ meine Angaben für diesen Check und die Rückmeldung verarbeitet. Details stehen in der <a class="quiz-link" href="/datenschutz">Datenschutzerklärung</a>.';
      consentField.appendChild(consentInput);
      consentField.appendChild(consentText);

      const honeypotField = document.createElement("div");
      honeypotField.className = "honeypot-field";
      const honeypotLabel = document.createElement("label");
      honeypotLabel.textContent = "Website";
      honeypotLabel.setAttribute("for", "quiz-website");
      const honeypotInput = document.createElement("input");
      honeypotInput.id = "quiz-website";
      honeypotInput.type = "text";
      honeypotInput.name = "website";
      honeypotInput.autocomplete = "off";
      honeypotField.appendChild(honeypotLabel);
      honeypotField.appendChild(honeypotInput);

      elements.options.appendChild(emailField);
      elements.options.appendChild(nameField);
      elements.options.appendChild(companyField);
      elements.options.appendChild(phoneField);
      elements.options.appendChild(consentField);
      elements.options.appendChild(honeypotField);
    }
  }

  function renderStep() {
    const step = steps[state.currentStep];
    if (!step) return;

    elements.question.textContent = step.question;
    elements.subtitle.textContent = step.subtitle || "";
    elements.options.dataset.layout = step.type;
    elements.options.dataset.step = step.id;
    setHint("");
    setError("");
    clearOptions();

    if (step.type === "visual_cards") {
      const selected =
        typeof state.answers[step.id] === "string"
          ? state.answers[step.id]
          : "";
      step.cards.forEach((card) => {
        const isSelected = selected === card.value;
        const cardEl = createCard(card, step.id, isSelected);
        cardEl.addEventListener("click", () => {
          state.answers[step.id] = card.value;
          saveState();
          renderStep();
          updateNextState();
        });
        elements.options.appendChild(cardEl);
      });
    }

    if (step.type === "icon_options") {
      const selected =
        typeof state.answers[step.id] === "string"
          ? state.answers[step.id]
          : "";
      step.options.forEach((option) => {
        const isSelected = selected === option.value;
        const optionEl = createOption(option, step.id, isSelected);
        optionEl.addEventListener("click", () => {
          state.answers[step.id] = option.value;
          saveState();
          renderStep();
          updateNextState();
        });
        elements.options.appendChild(optionEl);
      });
    }

    if (step.type === "multiple_choice") {
      const selectedValues = new Set(
        Array.isArray(state.answers[step.id])
          ? (state.answers[step.id] as string[]).filter(
              (value): value is string => typeof value === "string",
            )
          : [],
      );
      setHint(`Du kannst bis zu ${step.maxSelections} Optionen wählen.`);
      step.options.forEach((option) => {
        const isSelected = selectedValues.has(option.value);
        const multiEl = createMulti(option, step.id, isSelected);
        multiEl.addEventListener("click", () => {
          const current = new Set(
            Array.isArray(state.answers[step.id])
              ? (state.answers[step.id] as string[]).filter(
                  (value): value is string => typeof value === "string",
                )
              : [],
          );
          if (current.has(option.value)) {
            current.delete(option.value);
          } else if (current.size < step.maxSelections) {
            current.add(option.value);
          } else {
            setHint(`Maximal ${step.maxSelections} Optionen.`);
            return;
          }
          state.answers[step.id] = [...current];
          saveState();
          renderStep();
          updateNextState();
        });
        elements.options.appendChild(multiEl);
      });
    }

    if (step.type === "name_capture" || step.type === "contact_capture") {
      renderInputs(step);
    }

    elements.back.disabled = state.currentStep === 0;
    elements.next.textContent =
      step.type === "contact_capture" ? "Auswertung senden" : "Weiter";
    updateNextState();
    updateProgress();
  }

  function updateNextState() {
    const step = steps[state.currentStep];
    if (!step) return;
    elements.next.disabled = !isStepValid(step, state);
    if (step.type !== "contact_capture") {
      elements.next.textContent =
        step.optional && !state.answers[step.id] ? "Überspringen" : "Weiter";
    }
  }

  function goToStep(stepIndex: number) {
    state.currentStep = Math.min(Math.max(stepIndex, 0), totalSteps - 1);
    saveState();
    renderStep();
  }

  function getRecommendationCopy(rec: QuizResults["recommendations"][number]): {
    title: string;
    description: string;
    icon: string;
  } {
    const fallback = {
      title: rec.title,
      description: rec.description,
      icon: rec.icon,
    };
    const copyByTitle: Record<
      string,
      { title: string; description: string; icon: string }
    > = {
      "Support-Agent für Kundenanfragen": {
        title: "Support-Agent mit Übergabe-Regeln",
        description:
          "Ein Agent sortiert Anfragen, bereitet Antworten vor und gibt sensible Fälle an Menschen weiter.",
        icon: "Support",
      },
      "Backoffice-Agent für Rechnungen und Dokumente": {
        title: "Backoffice-Agent für Dokumentenflüsse",
        description:
          "Belege und Dokumente werden ausgelesen, geprüft abgelegt und für Buchhaltung oder Rückfragen vorbereitet.",
        icon: "Docs",
      },
      "Vertriebs-Agent für Leads und Follow-ups": {
        title: "Vertriebs-Agent für Recherche und Follow-ups",
        description:
          "Leads werden qualifiziert, im CRM vorbereitet und mit nachvollziehbaren nächsten Schritten versehen.",
        icon: "Sales",
      },
      "Reporting-Agent für bessere Entscheidungen": {
        title: "Reporting-Agent mit verlässlichem Datenfluss",
        description:
          "Status, Zahlen und offene Punkte werden aus deinen Tools gesammelt, protokolliert und verständlich aufbereitet.",
        icon: "Data",
      },
      "KI-Integration in bestehende Systeme prüfen": {
        title: "Agenten-Integration in bestehende Systeme prüfen",
        description:
          "Wir prüfen Tools, Datenfluss, Freigaben und den ersten Agenten-Workflow, der messbar entlastet.",
        icon: "Flow",
      },
      "Automatisierungspotenzial prüfen": {
        title: "Automatisierungspotenzial prüfen",
        description:
          "Starte mit einem klaren Blick auf Prozesse, Daten, Tool-Stack, Risiken und sinnvolle erste Aufgabenräume.",
        icon: "Ready",
      },
      "Agenten-Workflow entwickeln": {
        title: "Agenten-Workflow entwickeln",
        description:
          "Baue einen kontrollierbaren Workflow mit Rollen, Logs, Freigaben und Integration in bestehende Systeme.",
        icon: "Ops",
      },
    };

    return copyByTitle[rec.title] || fallback;
  }

  function getAnswerLabels(step: QuizStep, value: unknown): string[] {
    if (value === undefined || value === null) return [];

    const values = Array.isArray(value) ? value : [value];
    const options =
      step.type === "visual_cards"
        ? step.cards.map((card) => ({
            label: card.subtitle
              ? `${card.title} - ${card.subtitle}`
              : card.title,
            value: card.value,
          }))
        : step.type === "icon_options" || step.type === "multiple_choice"
          ? step.options.map((option) => ({
              label: option.text,
              value: option.value,
            }))
          : [];

    return values.map((item) => {
      const rawValue =
        typeof item === "string"
          ? item
          : (JSON.stringify(item ?? "") ?? String(item ?? ""));
      return (
        options.find((option) => option.value === rawValue)?.label || rawValue
      );
    });
  }

  function buildAnswerDetails() {
    return quizQuestions
      .map((step) => {
        const rawValue = state.answers[step.id];
        const labels = getAnswerLabels(step, rawValue);
        return {
          id: step.id,
          question: step.question,
          answers: labels,
          rawValue,
        };
      })
      .filter((item) => item.answers.length > 0);
  }

  function buildEmailDraft(
    results: QuizResults,
    recommendations: ReturnType<typeof getRecommendationCopy>[],
  ) {
    const firstName = state.userInfo.name.trim().split(/\s+/)[0] || "du";
    const topRecommendation =
      recommendations[0]?.title || "Ablauf in der Tiefe prüfen";
    const bookingUrl =
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ20waM7c1kcdYXBfRS0TPxCy0ESIBNKTbcfpQuoQJXW-jjtyb9_BRb9DjeCoN2D5BqrsbsxurS2?gv=true";
    const servicesUrl = "https://codariq.de/#benefits";
    const faqUrl = "https://codariq.de/faq";

    return {
      to: state.userInfo.email,
      subject: `Deine Codariq Auswertung: ${results.outcomeTitle}`,
      previewText: `${results.outcomeTitle}. Nächster Schritt: ${results.nextStep}.`,
      headline: `${firstName}, deine Einschätzung ist da.`,
      text: [
        `Hallo ${firstName},`,
        `dein Check zeigt: ${results.outcomeTitle}.`,
        results.outcomeSummary,
        "Der wichtigste Punkt ist gerade:",
        topRecommendation,
        `In dem Ablauf stecken grob ${results.timeSavingsPotential} Stunden pro Woche, die ein sauber begrenzter Workflow oder Agent vorbereiten, sortieren oder nach Freigabe abarbeiten könnte.`,
        "Für eine belastbare Entscheidung prüfen wir den Arbeitsbereich in der Tiefe: Aufgaben, Datenquellen, Entscheidungspunkte, Freigaben, Risiken und erste Testfälle. Danach weißt du, ob KI wirklich gebraucht wird, wo ein Agent Arbeit abnehmen darf und was vor dem Betrieb geklärt werden muss.",
        "Diese Einschätzung ersetzt keine Rechtsberatung. Datenschutz, EU AI Act, Kontrolle und saubere Übergaben gehören aber von Anfang an in die Prüfung.",
        `Leistungen ansehen: ${servicesUrl}`,
        `Termin buchen: ${bookingUrl}`,
        `FAQ öffnen: ${faqUrl}`,
        "Wir freuen uns auf die Zusammenarbeit.",
        "Dein Codariq Team",
      ].join("\n\n"),
      recommendations,
      ctaUrl: servicesUrl,
      servicesUrl,
      bookingUrl,
      faqUrl,
      primaryCta: {
        label: "Leistungen ansehen",
        url: servicesUrl,
      },
      secondaryCta: {
        label: "Termin buchen",
        url: bookingUrl,
      },
      faqCta: {
        label: "FAQ öffnen",
        url: faqUrl,
      },
    };
  }

  async function submitQuiz() {
    setError("");
    const honeypot = document.getElementById(
      "quiz-website",
    ) as HTMLInputElement | null;
    if (!isValidEmail(state.userInfo.email)) {
      setError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (!state.userInfo.consent) {
      setError("Bitte bestätige die Datenschutzerklärung.");
      return;
    }
    if (honeypot && honeypot.value.trim()) {
      setError("Deine Anfrage wurde nicht angenommen.");
      return;
    }

    const results = calculateResults(state.answers);
    const answerDetails = buildAnswerDetails();
    const recommendations = results.recommendations.map(getRecommendationCopy);
    const displayName = state.userInfo.name.trim() || "Interessent/in";
    const displayCompany =
      state.userInfo.company.trim() || "Quiz (KI- und Automatisierungs-Check)";
    const missingOptionalInputs = [
      state.userInfo.name.trim() ? "" : "name",
      state.userInfo.company.trim() ? "" : "company",
      state.userInfo.phone.trim() ? "" : "phone",
      state.answers["q5_current_ai_use"] ? "" : "q5_current_ai_use",
      state.answers["q6_goal"] ? "" : "q6_goal",
    ].filter(Boolean);
    const answersSummary = answerDetails
      .map((answer) => `${answer.question}: ${answer.answers.join(", ")}`)
      .join(" | ");
    const recommendationsSummary = recommendations
      .map((rec) => rec.title)
      .join(", ");
    const resultSummary = {
      automationPotential: results.automationPotential,
      level: results.level,
      timeSavingsHoursPerWeek: results.timeSavingsPotential,
      estimatedValuePerMonth: results.roiEstimate,
      productFit: results.productFit,
      urgencyScore: results.urgencyScore,
      outcomeTitle: results.outcomeTitle,
      outcomeSummary: results.outcomeSummary,
      dimensions: results.dimensions,
      auditSignal: results.auditSignal,
      affectedDataClasses: results.affectedDataClasses,
      agentPermissionLevel: results.agentPermissionLevel,
      nextStep: results.nextStep,
      missingOptionalInputs,
      recommendations,
    };
    const emailDraft = buildEmailDraft(results, recommendations);
    const message = [
      `Quiz Antworten: ${answersSummary || "keine"}.`,
      `Einschätzung: ${results.outcomeTitle}. Score: ${results.automationPotential}%, Prüfbedarf: ${results.auditSignal}.`,
      `Empfohlene nächste Schritte: ${recommendationsSummary || "keine"}.`,
    ].join(" ");
    const payload = {
      name: displayName,
      company: displayCompany,
      email: state.userInfo.email,
      phone: state.userInfo.phone,
      message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      source: "codariq_quiz",
      answers: state.answers,
      answerDetails,
      results,
      resultSummary,
      emailDraft,
      honeypot: honeypot ? honeypot.value : "",
    };

    try {
      const webhookUrl = "/webhook-proxy.php";
      elements.next.disabled = true;
      elements.next.textContent = "Auswertung wird gesendet...";
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 200) {
        elements.next.textContent = "Auswertung angefragt";
        showResults(results);
        localStorage.removeItem(storageKey);
        return;
      }
      let serverMessage = "";
      try {
        const data = await response.json();
        if (data && typeof data.message === "string") {
          serverMessage = data.message;
        }
      } catch {
        // Ignore parse errors for non-JSON responses.
      }
      if (response.status === 400) {
        setError("Bitte füll alle Pflichtfelder korrekt aus.");
      } else if (response.status === 403) {
        setError("Deine Anfrage wurde nicht angenommen.");
      } else if (response.status === 429) {
        setError(
          serverMessage ||
            "Zu viele Anfragen. Bitte versuch es in ein paar Minuten erneut.",
        );
      } else {
        setError(
          "Die Auswertung konnte nicht gesendet werden. Bitte versuche es erneut.",
        );
      }
      elements.next.disabled = false;
      elements.next.textContent = "Auswertung anfordern";
      return;
    } catch {
      setError(
        "Die Auswertung konnte nicht gesendet werden. Bitte versuche es erneut.",
      );
      elements.next.disabled = false;
      elements.next.textContent = "Auswertung anfordern";
    }
  }

  function showResults(results: QuizResults) {
    elements.quizShell.classList.add("hidden");
    elements.result.classList.remove("hidden");
    elements.result.classList.add("is-revealed");
    elements.resultPotential.textContent = `${results.automationPotential}%`;
    elements.resultLevel.textContent = results.outcomeTitle;
    elements.resultSummary.textContent = results.outcomeSummary;
    elements.resultTime.textContent = String(results.timeSavingsPotential);
    elements.resultRoi.textContent = results.auditSignal;
    elements.resultRecommendations.innerHTML = "";
    results.recommendations.forEach((rec) => {
      const recommendation = getRecommendationCopy(rec);
      const item = document.createElement("li");
      item.className = "quiz-result-item";
      item.innerHTML = `
        <span class="quiz-result-icon">${recommendation.icon}</span>
        <div>
          <p class="quiz-result-item-title">${recommendation.title}</p>
          <p class="quiz-result-item-description">${recommendation.description}</p>
        </div>
      `;
      elements.resultRecommendations.appendChild(item);
    });

    const successBanner = document.getElementById("quiz-success-banner");
    if (successBanner) {
      successBanner.classList.remove("hidden");
    }
  }

  elements.back.addEventListener("click", () => {
    if (state.currentStep > 0) {
      goToStep(state.currentStep - 1);
    }
  });

  elements.next.addEventListener("click", () => {
    const step = steps[state.currentStep];
    if (!step) return;
    setError("");
    if (step.type === "multiple_choice" && !step.optional) {
      const rawSelected = state.answers[step.id];
      const selected = Array.isArray(rawSelected) ? rawSelected : [];
      if (selected.length === 0) {
        setError("Bitte wähle mindestens eine Option.");
        return;
      }
    }
    if (step.type === "name_capture" && !state.userInfo.name.trim()) {
      setError("Bitte gib deinen Namen an.");
      return;
    }
    if (step.type === "contact_capture") {
      submitQuiz();
      return;
    }
    if (
      !step.optional &&
      step.type !== "name_capture" &&
      !state.answers[step.id]
    ) {
      setError("Bitte wähle eine Option.");
      return;
    }
    goToStep(state.currentStep + 1);
  });

  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Ignore reset errors (e.g., storage unavailable).
  }
  renderStep();
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
