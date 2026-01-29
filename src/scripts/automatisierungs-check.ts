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
  resultLevel: HTMLParagraphElement;
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

const init = () => {
  const quizQuestions: Array<
    VisualCardStep | IconOptionStep | MultipleChoiceStep
  > = [
    {
      id: "q1_automation_attitude",
      question: "Wie stehst du zum Thema Automatisierung?",
      subtitle: "Wir fragen das, um deine Motivation besser zu verstehen.",
      type: "visual_cards",
      cards: [
        {
          title: "Mega - Automatisierung ist die Zukunft",
          value: "enthusiast",
          emoji: "🚀",
        },
        {
          title: "Überzeugt. Ich möchte automatisieren",
          value: "convinced",
          emoji: "✅",
        },
        {
          title: "Neutral - Bin aber offen",
          value: "neutral",
          emoji: "🙂",
        },
        {
          title: "Skeptisch - brauche erst Beweise",
          value: "skeptical",
          emoji: "🧐",
        },
      ],
    },
    {
      id: "q2_biggest_hurdle",
      question: "Wo liegt aktuell deine größte Herausforderung?",
      subtitle:
        "Damit wir dir die perfekte Lösung für deine Situation empfehlen können.",
      type: "icon_options",
      options: [
        {
          icon: "🚀",
          text: "Ich will endlich mit Automatisierung starten",
          value: "getting_started",
        },
        {
          icon: "⚡",
          text: "Meine Konkurrenz ist schneller als ich",
          value: "competition",
        },
        {
          icon: "💡",
          text: "Mein Team ist mit den Tools überfordert",
          value: "team_overwhelmed",
        },
        {
          icon: "⏰",
          text: "Zu viel Zeit geht für Routineaufgaben drauf",
          value: "time_waste",
        },
        {
          icon: "🎯",
          text: "Ich will neue Möglichkeiten entdecken",
          value: "exploration",
        },
        {
          icon: "📊",
          text: "Etwas anderes",
          value: "other",
        },
      ],
    },
    {
      id: "q3_motivation",
      question: "Wie motiviert bist du, deine Situation zu verändern?",
      subtitle:
        "Wir fragen das, um deine Motivation herauszufinden: Wie sehr willst du das wirklich?",
      type: "visual_cards",
      cards: [
        {
          title: "Sehr motiviert",
          subtitle: "Kann es kaum erwarten",
          value: "very_motivated",
          emoji: "🔥",
        },
        {
          title: "Motiviert",
          subtitle: "Ich möchte umsetzen",
          value: "motivated",
          emoji: "✅",
        },
        {
          title: "Wenig motiviert",
          subtitle: "Bin eher nur neugierig",
          value: "low_motivated",
          emoji: "🤔",
        },
        {
          title: "Gar nicht",
          subtitle: "Bin nur hier, weil ich muss",
          value: "not_motivated",
          emoji: "😶",
        },
      ],
    },
    {
      id: "q4_experience_level",
      question: "Wo stehst du aktuell beim Thema Automatisierung?",
      subtitle:
        "Damit wir dir die perfekte Lösung an dein aktuelles Niveau anpassen können.",
      type: "visual_cards",
      cards: [
        {
          icon: "🌱",
          title: "Neuling",
          subtitle:
            "Tendenz bei 0. Ich weiß kaum bis gar nichts über das Thema. Bin aber interessiert.",
          value: "beginner",
        },
        {
          icon: "📚",
          title: "Anfänger",
          subtitle:
            "Ich habe schon mal reingeschnuppert, aber nur sehr oberflächlich.",
          value: "novice",
        },
        {
          icon: "💡",
          title: "Anwender",
          subtitle:
            "Ich kenne n8n, Zapier oder Make und habe schon häufig damit gearbeitet.",
          value: "user",
        },
        {
          icon: "🎓",
          title: "Fortgeschritten",
          subtitle:
            "Ich nutze Automatisierung täglich und kenne die gängigsten Tools. Ich möchte tiefer aber noch eintauchen.",
          value: "advanced",
        },
      ],
    },
    {
      id: "q5_use_cases",
      question:
        "Hast du schon eine konkrete Vorstellung wie Automatisierung dich unterstützen kann?",
      subtitle:
        "Wir fragen das damit wir dir relevante Lösungen zeigen können.",
      type: "multiple_choice",
      maxSelections: 3,
      options: [
        {
          text: "Einen soliden Einstieg in Automatisierung finden",
          value: "getting_started",
        },
        {
          text: "Kundenanfragen automatisch beantworten",
          value: "customer_support",
        },
        {
          text: "Rechnungsstellung und Buchhaltung automatisieren",
          value: "invoicing",
        },
        {
          text: "Geschäftsprozesse digitalisieren und optimieren",
          value: "process_automation",
        },
        {
          text: "Marketing und Lead-Generierung automatisieren",
          value: "marketing",
        },
        {
          text: "Datenerfassung und Reporting automatisieren",
          value: "data_automation",
        },
        {
          text: "KI strategisch ins Business integrieren",
          value: "ai_strategy",
        },
        {
          text: "Noch keine Ahnung, bin einfach neugierig",
          value: "no_idea",
        },
      ],
    },
    {
      id: "q6_goal",
      question: "Was ist dein Ziel?",
      subtitle: "Wir fragen das, um deine Ziele auch tatsächlich zu berücksichtigen.",
      type: "visual_cards",
      cards: [
        {
          icon: "🔍",
          title: "Schnuppern",
          subtitle: "Erstmal nur reinschnuppern und Inspiration holen",
          value: "exploration",
        },
        {
          icon: "🚀",
          title: "Einstieg",
          subtitle: "Einen klaren Einstieg ins Thema Automatisierung finden",
          value: "getting_started",
        },
        {
          icon: "📖",
          title: "Lernen & Umsetzen",
          subtitle:
            "Automatisierung richtig lernen, verstehen, anwenden und implementieren",
          value: "learn_implement",
        },
        {
          icon: "👔",
          title: "Ready2Use",
          subtitle:
            "Ich möchte nicht selbst lernen. Ich möchte jemanden der das für mich umsetzt",
          value: "ready_to_use",
        },
      ],
    },
    {
      id: "q7_urgency",
      question: "Wie dringend brauchst du Ergebnisse?",
      subtitle:
        "Wir fragen das damit wir dein Tempo berücksichtigen können.",
      type: "icon_options",
      options: [
        {
          icon: "⚡",
          text: "So schnell wie möglich",
          value: "asap",
        },
        {
          icon: "🎯",
          text: "Zeitnah, in den nächsten 2 bis 3 Monaten",
          value: "soon",
        },
        {
          icon: "💡",
          text: "Keine Eile, ich kann mir Zeit lassen",
          value: "no_rush",
        },
      ],
    },
    {
      id: "q8_company_structure",
      question: "Wie bist du aktuell aufgestellt?",
      subtitle: "Damit wir Empfehlungen geben können, die zu deiner Situation passen.",
      type: "visual_cards",
      cards: [
        {
          icon: "🤓",
          title: "Solopreneur / Einzelkämpfer",
          subtitle: "Ich mache alles alleine",
          value: "solopreneur",
        },
        {
          icon: "🌱",
          title: "Ich gründe gerade erst",
          subtitle: "Bin noch ganz am Anfang",
          value: "startup",
        },
        {
          icon: "🤝",
          title: "Kleines Team (2 bis 10 Mitarbeiter)",
          subtitle: "Wir sind ein eingespieltes Team",
          value: "small_team",
        },
        {
          icon: "🏢",
          title: "Etabliertes Unternehmen (mehr als 10 Mitarbeiter)",
          subtitle: "Wir haben feste Strukturen",
          value: "established",
        },
      ],
    },
    {
      id: "q9_time_waste",
      question:
        "Hand aufs Herz: Wie viel Zeit fressen manuelle Routinen (E-Mails, Verwaltung, Datenerfassung) aktuell pro Woche?",
      subtitle:
        "Wir fragen das Damit wir einschätzen können, wie viel Potenzial KI bei dir freisetzen kann.",
      type: "visual_cards",
      cards: [
        {
          emoji: "😊",
          title: "Wenig (unter 2 Std.)",
          subtitle: "Ich bin gut organisiert",
          value: "low",
        },
        {
          emoji: "⏳",
          title: "Geht so (2 bis 5 Std.)",
          subtitle: "Könnte besser sein",
          value: "medium",
        },
        {
          emoji: "🔥",
          title: "Viel zu viel (5 bis 10 Std.)",
          subtitle: "Das nervt mich wirklich",
          value: "high",
        },
        {
          emoji: "🚨",
          title: "Alarmstufe Rot (über 10 Std.)",
          subtitle: "Ich ertrinke in Arbeit",
          value: "critical",
        },
      ],
    },
    {
      id: "q10_budget",
      question: "Wie viel Budget steht dir zur Verfügung?",
      subtitle:
        "Wir fragen das damit wir dir nur Empfehlungen geben, die zu deinem Budget passen.",
      type: "visual_cards",
      cards: [
        {
          icon: "🆓",
          title: "0 Euro",
          subtitle: "Erstmal kostenlos",
          value: "free",
        },
        {
          icon: "💰",
          title: "0 bis 200 Euro",
          subtitle: "Kleines Budget für den Einstieg",
          value: "starter",
        },
        {
          icon: "📚",
          title: "200 bis 1.000 Euro",
          subtitle: "Ich möchte systematisch lernen",
          value: "learning",
        },
        {
          icon: "💎",
          title: "1.000 bis 3.000 Euro",
          subtitle: "Mir ist eine intensive Betreuung wichtig",
          value: "intensive",
        },
        {
          icon: "👑",
          title: "über 3.000 Euro",
          subtitle: "Ich will das beste Ergebnis, Preis ist zweitrangig",
          value: "premium",
        },
      ],
    },
  ];

  const captureSteps: Array<NameCaptureStep | ContactCaptureStep> = [
    {
      id: "capture_name",
      question: "Wie dürfen wir dich ansprechen?",
      subtitle: "Wir nutzen deinen Namen für eine persönliche Auswertung.",
      type: "name_capture",
    },
    {
      id: "capture_contact",
      question: "Wohin dürfen wir dir die Auswertung schicken?",
      subtitle:
        "Deine Daten werden nur für diesen Check verwendet. Kein Spam.",
      type: "contact_capture",
    },
  ];

  const progressMessages: Array<{ at: number; text: string }> = [
    { at: 30, text: "🔥 Du machst das großartig!" },
    { at: 50, text: "💪 Hälfte geschafft!" },
    { at: 80, text: "🎯 Fast am Ziel!" },
  ];

  const steps: QuizStep[] = [...quizQuestions, ...captureSteps];
  const totalSteps = steps.length;
  const storageKey = "codariq_quiz_v1";

  const state: QuizRunState = {
    currentStep: 0,
    answers: {},
    userInfo: {
      name: "",
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
    resultLevel: getElement<HTMLParagraphElement>("result-level"),
    resultTime: getElement<HTMLSpanElement>("result-time"),
    resultRoi: getElement<HTMLSpanElement>("result-roi"),
    resultRecommendations: getElement<HTMLUListElement>("result-recommendations"),
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
    elements.stepLabel.textContent = `Schritt ${state.currentStep + 1} von ${totalSteps}`;
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
    isSelected: boolean
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
      const icon = document.createElement("span");
      icon.className = "quiz-card-icon";
      icon.textContent = option.icon ?? option.emoji ?? "";
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
    isSelected: boolean
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `quiz-option${isSelected ? " is-selected" : ""}`;
    button.dataset.value = option.value;
    button.dataset.step = stepId;
    button.setAttribute("aria-pressed", String(isSelected));

    const icon = document.createElement("span");
    icon.className = "quiz-option-icon";
    icon.textContent = option.icon || "";
    button.appendChild(icon);

    const text = document.createElement("span");
    text.className = "quiz-option-text";
    text.textContent = option.text;
    button.appendChild(text);

    return button;
  }

  function createMulti(
    option: QuizOption,
    stepId: string,
    isSelected: boolean
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
      label.textContent = "Dein Name";
      label.setAttribute("for", "quiz-name");
      const input = document.createElement("input");
      input.id = "quiz-name";
      input.type = "text";
      input.placeholder = "z.B. Marcel";
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
      const emailLabel = document.createElement("label");
      emailLabel.textContent = "E-Mail";
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
      nameField.appendChild(emailLabel);
      nameField.appendChild(emailInput);

      const phoneField = document.createElement("div");
      phoneField.className = "quiz-field";
      const phoneLabel = document.createElement("label");
      phoneLabel.textContent = "Telefon (optional)";
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
        'Ich stimme der Verarbeitung meiner Daten gemäß der <a class="underline text-gray-800" href="/datenschutz">Datenschutzerklärung</a> zu.';
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

      elements.options.appendChild(nameField);
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
              (value): value is string => typeof value === "string"
            )
          : []
      );
      setHint(`Du kannst bis zu ${step.maxSelections} Optionen wählen.`);
      step.options.forEach((option) => {
        const isSelected = selectedValues.has(option.value);
        const multiEl = createMulti(option, step.id, isSelected);
        multiEl.addEventListener("click", () => {
          const current = new Set(
            Array.isArray(state.answers[step.id])
              ? (state.answers[step.id] as string[]).filter(
                  (value): value is string => typeof value === "string"
                )
              : []
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
      step.type === "contact_capture" ? "Auswertung anfordern" : "Weiter";
    updateNextState();
    updateProgress();
  }

  function updateNextState() {
    const step = steps[state.currentStep];
    if (!step) return;
    elements.next.disabled = !isStepValid(step, state);
  }

  function goToStep(stepIndex: number) {
    state.currentStep = Math.min(Math.max(stepIndex, 0), totalSteps - 1);
    saveState();
    renderStep();
  }

  async function submitQuiz() {
    setError("");
    const honeypot = document.getElementById(
      "quiz-website"
    ) as HTMLInputElement | null;
    if (!state.userInfo.name.trim()) {
      setError("Bitte gib deinen Namen an.");
      return;
    }
    if (!isValidEmail(state.userInfo.email)) {
      setError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    if (!state.userInfo.consent) {
      setError("Bitte bestätige die Datenschutzerklärung.");
      return;
    }
    if (honeypot && honeypot.value.trim()) {
      setError("Deine Anfrage wurde als Spam erkannt.");
      return;
    }

    const results = calculateResults(state.answers);
    const answersSummary = Object.entries(state.answers)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }
        if (typeof value === "string") {
          return `${key}: ${value}`;
        }
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join(" | ");
    const recommendationsSummary = results.recommendations
      .map((rec) => rec.title)
      .join(", ");
    const message = [
      `Quiz Antworten: ${answersSummary || "keine"}.`,
      `Automatisierungspotenzial: ${results.automationPotential}%, Level: ${results.level}.`,
      `Top Empfehlungen: ${recommendationsSummary || "keine"}.`,
    ].join(" ");
    const payload = {
      name: state.userInfo.name,
      company: "Quiz (Automatisierungs-Check)",
      email: state.userInfo.email,
      phone: state.userInfo.phone,
      message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      source: "codariq_quiz",
      answers: state.answers,
      results,
      honeypot: honeypot ? honeypot.value : "",
    };

    try {
      const webhookUrl = import.meta.env.PUBLIC_N8N_WEBHOOK_URL;
      const webhookAuth = import.meta.env.PUBLIC_N8N_WEBHOOK_AUTH;
      if (!webhookUrl || !webhookAuth) {
        setError("Die Auswertung ist aktuell nicht verfügbar. Bitte versuche es später erneut.");
        return;
      }
      elements.next.disabled = true;
      elements.next.textContent = "Senden...";
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: webhookAuth,
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 200) {
        showResults(results);
        localStorage.removeItem(storageKey);
        return;
      }
      if (response.status === 400) {
        setError("Bitte füll alle Pflichtfelder korrekt aus.");
      } else if (response.status === 403) {
        setError("Deine Anfrage wurde als Spam erkannt.");
      } else if (response.status === 429) {
        setError("Zu viele Anfragen. Bitte versuch es in ein paar Minuten erneut.");
      } else {
        setError("Es gab ein Problem beim Senden. Bitte versuche es erneut.");
      }
      elements.next.disabled = false;
      elements.next.textContent = "Auswertung anfordern";
      return;
    } catch {
      setError(
        "Es gab ein Problem beim Senden. Bitte versuche es erneut."
      );
      elements.next.disabled = false;
      elements.next.textContent = "Auswertung anfordern";
    }
  }

  function showResults(results: QuizResults) {
    elements.quizShell.classList.add("hidden");
    elements.result.classList.remove("hidden");
    elements.resultPotential.textContent = `${results.automationPotential}%`;
    elements.resultLevel.textContent = results.level;
    elements.resultTime.textContent = String(results.timeSavingsPotential);
    elements.resultRoi.textContent = String(results.roiEstimate);
    elements.resultRecommendations.innerHTML = "";
    results.recommendations.forEach((rec) => {
      const item = document.createElement("li");
      item.className = "quiz-result-item";
      item.innerHTML = `
        <span class="quiz-result-icon">${rec.icon}</span>
        <div>
          <p class="font-bold text-gray-900">${rec.title}</p>
          <p class="text-sm text-gray-600">${rec.description}</p>
        </div>
      `;
      elements.resultRecommendations.appendChild(item);
    });
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
    if (step.type === "multiple_choice") {
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
    if (step.type !== "name_capture" && !state.answers[step.id]) {
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
