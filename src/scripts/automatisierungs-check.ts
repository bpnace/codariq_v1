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
      question: "Wie stehst du zu Agenten und Automatisierung?",
      subtitle:
        "Es geht darum, wie offen du für klar begrenzte Agenten mit menschlicher Kontrolle bist.",
      type: "visual_cards",
      cards: [
        {
          title: "Klarer Bedarf. Ich will Agenten sinnvoll einsetzen",
          value: "enthusiast",
          icon: "01",
        },
        {
          title: "Überzeugt, wenn Aufgabenraum und Grenzen sauber sind",
          value: "convinced",
          icon: "02",
        },
        {
          title: "Offen, aber ich will erst konkrete Fälle sehen",
          value: "neutral",
          icon: "03",
        },
        {
          title: "Skeptisch. Ohne Freigaben, Logs und Kontrolle nicht",
          value: "skeptical",
          icon: "04",
        },
      ],
    },
    {
      id: "q2_biggest_hurdle",
      question: "Wo liegt aktuell deine größte Herausforderung?",
      subtitle:
        "Damit die Empfehlung nicht nach Tool-Liste klingt, sondern zu deinem echten Arbeitsfluss passt.",
      type: "icon_options",
      options: [
        {
          icon: "Start",
          text: "Ich will sauber mit Agenten und Automatisierung starten",
          value: "getting_started",
        },
        {
          icon: "Tempo",
          text: "Unsere Abläufe sind zu langsam oder zu manuell",
          value: "competition",
        },
        {
          icon: "Team",
          text: "Mein Team verliert Kontext zwischen Tools, Übergaben und Entscheidungen",
          value: "team_overwhelmed",
        },
        {
          icon: "Zeit",
          text: "Zu viel Zeit geht in wiederkehrende Aufgaben und Nachpflege",
          value: "time_waste",
        },
        {
          icon: "Use",
          text: "Ich will herausfinden, welche Aufgaben Agenten wirklich übernehmen dürfen",
          value: "exploration",
        },
        {
          icon: "Info",
          text: "Etwas anderes",
          value: "other",
        },
      ],
    },
    {
      id: "q3_motivation",
      question: "Wie klar ist dein Wille, daran wirklich etwas zu ändern?",
      subtitle:
        "Agenten bringen nur etwas, wenn Aufgaben, Datenfluss und Verantwortlichkeiten wirklich geklärt werden dürfen.",
      type: "visual_cards",
      cards: [
        {
          title: "Sehr klar",
          subtitle: "Wir wollen konkrete Abläufe umbauen",
          value: "very_motivated",
          icon: "01",
        },
        {
          title: "Klar genug",
          subtitle: "Wir wollen prüfen und dann umsetzen",
          value: "motivated",
          icon: "02",
        },
        {
          title: "Noch offen",
          subtitle: "Wir sammeln erst Orientierung",
          value: "low_motivated",
          icon: "03",
        },
        {
          title: "Kein echter Auftrag",
          subtitle: "Aktuell ist es eher ein Check von außen",
          value: "not_motivated",
          icon: "04",
        },
      ],
    },
    {
      id: "q4_experience_level",
      question:
        "Wo stehst du aktuell bei Agenten, Automatisierung und Integration?",
      subtitle:
        "So können wir einschätzen, ob du Grundlagen, Workflow-Design oder robuste Agenten-Architektur brauchst.",
      type: "visual_cards",
      cards: [
        {
          icon: "0",
          title: "Neuling",
          subtitle:
            "Ich kenne das Thema bisher nur grob und brauche eine saubere Einordnung.",
          value: "beginner",
        },
        {
          icon: "1",
          title: "Anfänger",
          subtitle:
            "Ich habe erste Tools getestet, aber noch keinen belastbaren Ablauf gebaut.",
          value: "novice",
        },
        {
          icon: "2",
          title: "Anwender",
          subtitle:
            "Ich kenne n8n, Zapier oder Make und habe schon praktisch damit gearbeitet.",
          value: "user",
        },
        {
          icon: "3",
          title: "Fortgeschritten",
          subtitle:
            "Ich nutze Automatisierung regelmäßig und will Agenten mit Grenzen, Freigaben, Logs und Datenfluss sauber aufsetzen.",
          value: "advanced",
        },
      ],
    },
    {
      id: "q5_use_cases",
      question:
        "Hast du schon eine konkrete Aufgabe, die ein Agent übernehmen oder vorbereiten soll?",
      subtitle:
        "Wähle bis zu drei Bereiche. Wichtig ist nicht nur die Aufgabe, sondern auch der erlaubte Handlungsspielraum.",
      type: "multiple_choice",
      maxSelections: 3,
      options: [
        {
          text: "Einen soliden Einstieg in Agenten und sichere Automatisierung finden",
          value: "getting_started",
        },
        {
          text: "Kundenanfragen vorbereiten, beantworten oder an Menschen übergeben",
          value: "customer_support",
        },
        {
          text: "Rechnungsstellung, Buchhaltung oder Belegflüsse strukturieren",
          value: "invoicing",
        },
        {
          text: "Geschäftsprozesse über Tools, Daten und Freigaben verbinden",
          value: "process_automation",
        },
        {
          text: "Marketing, Recherche oder Lead-Prozesse kontrolliert unterstützen",
          value: "marketing",
        },
        {
          text: "Datenerfassung, Reporting und Logs verlässlicher machen",
          value: "data_automation",
        },
        {
          text: "Agenten strategisch in bestehende Systeme integrieren",
          value: "ai_strategy",
        },
        {
          text: "Noch kein konkreter Fall, ich will den Aufgabenraum erst finden",
          value: "no_idea",
        },
      ],
    },
    {
      id: "q6_goal",
      question: "Was ist dein Ziel?",
      subtitle:
        "Sag uns, ob du Orientierung, eigenes Können oder eine umgesetzte Lösung brauchst.",
      type: "visual_cards",
      cards: [
        {
          icon: "Scan",
          title: "Orientierung",
          subtitle: "Erst prüfen, welche Aufgabenräume überhaupt sinnvoll sind",
          value: "exploration",
        },
        {
          icon: "Plan",
          title: "Einstieg",
          subtitle:
            "Einen klaren Einstieg in Agenten, Automatisierung und Grenzen finden",
          value: "getting_started",
        },
        {
          icon: "Build",
          title: "Lernen & Umsetzen",
          subtitle:
            "Agenten und Automatisierung verstehen, anwenden und kontrolliert implementieren",
          value: "learn_implement",
        },
        {
          icon: "Done",
          title: "Umsetzung",
          subtitle:
            "Ich möchte nicht selbst bauen. Ich brauche einen umgesetzten Agenten mit klarer Kontrolle",
          value: "ready_to_use",
        },
      ],
    },
    {
      id: "q7_urgency",
      question: "Wie dringend brauchst du Ergebnisse?",
      subtitle:
        "Damit wir Tempo, Risiko und Tiefe realistisch zusammenbringen.",
      type: "icon_options",
      options: [
        {
          icon: "Now",
          text: "Schnell. Ein erster belastbarer Ablauf soll zeitnah stehen",
          value: "asap",
        },
        {
          icon: "Next",
          text: "Zeitnah, in den nächsten 2 bis 3 Monaten",
          value: "soon",
        },
        {
          icon: "Calm",
          text: "Keine Eile. Ich will erst sauber verstehen und planen",
          value: "no_rush",
        },
      ],
    },
    {
      id: "q8_company_structure",
      question: "Wie bist du aktuell aufgestellt?",
      subtitle:
        "Agenten brauchen andere Grenzen, wenn eine Person entscheidet oder mehrere Rollen beteiligt sind.",
      type: "visual_cards",
      cards: [
        {
          icon: "Solo",
          title: "Solopreneur / Einzelkämpfer",
          subtitle: "Ich entscheide und arbeite weitgehend allein",
          value: "solopreneur",
        },
        {
          icon: "New",
          title: "Ich gründe gerade erst",
          subtitle: "Strukturen, Tools und Datenflüsse entstehen gerade",
          value: "startup",
        },
        {
          icon: "Team",
          title: "Kleines Team (2 bis 10 Mitarbeiter)",
          subtitle:
            "Wir brauchen klare Übergaben, Zuständigkeiten und Freigaben",
          value: "small_team",
        },
        {
          icon: "Org",
          title: "Etabliertes Unternehmen (mehr als 10 Mitarbeiter)",
          subtitle:
            "Wir haben feste Strukturen, Systeme und Kontrollanforderungen",
          value: "established",
        },
      ],
    },
    {
      id: "q9_time_waste",
      question:
        "Wie viel Zeit geht aktuell pro Woche in manuelle Routinen, Übergaben, Datenpflege oder Nachkontrolle?",
      subtitle:
        "Das zeigt, ob ein Agent nur Komfort bringt oder echte Entlastung mit nachvollziehbaren Logs schaffen kann.",
      type: "visual_cards",
      cards: [
        {
          icon: "<2",
          title: "Wenig (unter 2 Std.)",
          subtitle: "Die wichtigsten Abläufe sind bereits stabil",
          value: "low",
        },
        {
          icon: "2-5",
          title: "Geht so (2 bis 5 Std.)",
          subtitle: "Es gibt klare Reibung, aber noch keinen großen Druck",
          value: "medium",
        },
        {
          icon: "5-10",
          title: "Viel (5 bis 10 Std.)",
          subtitle: "Hier lohnt sich ein sauber abgegrenzter Agenten-Workflow",
          value: "high",
        },
        {
          icon: "10+",
          title: "Kritisch (über 10 Std.)",
          subtitle: "Der Ablauf braucht Struktur, Kontrolle und Entlastung",
          value: "critical",
        },
      ],
    },
    {
      id: "q10_budget",
      question: "Wie viel Budget steht dir zur Verfügung?",
      subtitle:
        "So bleibt die Empfehlung realistisch: Lernen, Prototyp, Umsetzung oder intensivere Begleitung.",
      type: "visual_cards",
      cards: [
        {
          icon: "0",
          title: "0 Euro",
          subtitle: "Erstmal Orientierung ohne Investition",
          value: "free",
        },
        {
          icon: "S",
          title: "0 bis 200 Euro",
          subtitle: "Kleines Budget für Grundlagen und erste Schritte",
          value: "starter",
        },
        {
          icon: "M",
          title: "200 bis 1.000 Euro",
          subtitle:
            "Systematisch lernen oder einen ersten belastbaren Ablauf planen",
          value: "learning",
        },
        {
          icon: "L",
          title: "1.000 bis 3.000 Euro",
          subtitle:
            "Intensivere Begleitung oder ein konkreter Workflow-Prototyp",
          value: "intensive",
        },
        {
          icon: "XL",
          title: "über 3.000 Euro",
          subtitle:
            "Umsetzung mit sauberer Architektur, Kontrolle und Übergabe",
          value: "premium",
        },
      ],
    },
  ];

  const captureSteps: Array<NameCaptureStep | ContactCaptureStep> = [
    {
      id: "capture_name",
      question: "Wie dürfen wir dich ansprechen?",
      subtitle: "Der Name landet nur in deiner Auswertung und Anfrage.",
      type: "name_capture",
    },
    {
      id: "capture_contact",
      question: "Wohin dürfen wir dir die Auswertung schicken?",
      subtitle:
        "Wir nutzen die Daten nur für diesen Check und die passende Rückmeldung. Kein Newsletter-Zwang.",
      type: "contact_capture",
    },
  ];

  const progressMessages: Array<{ at: number; text: string }> = [
    { at: 30, text: "Die ersten Eckdaten stehen." },
    { at: 50, text: "Halbzeit. Jetzt wird der Aufgabenraum klarer." },
    { at: 80, text: "Fast fertig. Nur noch Kontakt und Auswertung." },
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
    isSelected: boolean,
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

  function getRecommendationCopy(rec: QuizResults["recommendations"][number]): {
    title: string;
    description: string;
    icon: string;
  } {
    const fallback = {
      title: rec.title,
      description: rec.description,
      icon: "Log",
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
      "Agentenfähigkeit klären": {
        title: "Agentenfähigkeit klären",
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
      recommendations[0]?.title || "Agentenfähigkeit klären";
    const recommendationLines = recommendations.map(
      (recommendation) =>
        `${recommendation.title}: ${recommendation.description}`,
    );

    return {
      to: state.userInfo.email,
      subject: `Deine Codariq Auswertung: ${topRecommendation}`,
      previewText: `${results.level} Agentenfähigkeit, ${results.timeSavingsPotential} Std. mögliche Entlastung pro Woche.`,
      headline: `${firstName}, dein sinnvoller Startpunkt ist: ${topRecommendation}`,
      text: [
        `Hallo ${firstName},`,
        `dein Check zeigt ${results.automationPotential}% Agentenfähigkeit (${results.level}).`,
        `Der Ablauf wirkt vor allem dort interessant, wo pro Woche etwa ${results.timeSavingsPotential} Stunden Routine, Übergabe oder Nachkontrolle hängen.`,
        `Nächster sinnvoller Schritt: ${topRecommendation}.`,
        ...recommendationLines.map((line) => `- ${line}`),
        "Wir melden uns mit einem konkreten Vorschlag, welche Daten, Freigaben und Stopps vor dem ersten Agenten-Test stehen sollten.",
      ].join("\n\n"),
      recommendations,
      ctaUrl: "https://codariq.de/#final-cta",
    };
  }

  async function submitQuiz() {
    setError("");
    const honeypot = document.getElementById(
      "quiz-website",
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
      setError("Deine Anfrage wurde nicht angenommen.");
      return;
    }

    const results = calculateResults(state.answers);
    const answerDetails = buildAnswerDetails();
    const recommendations = results.recommendations.map(getRecommendationCopy);
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
      recommendations,
    };
    const emailDraft = buildEmailDraft(results, recommendations);
    const message = [
      `Quiz Antworten: ${answersSummary || "keine"}.`,
      `Agenten- und Automatisierungspotenzial: ${results.automationPotential}%, Level: ${results.level}.`,
      `Empfohlene nächste Schritte: ${recommendationsSummary || "keine"}.`,
    ].join(" ");
    const payload = {
      name: state.userInfo.name,
      company: "Quiz (Agenten- und Automatisierungs-Check)",
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
    elements.resultLevel.textContent = results.level;
    elements.resultTime.textContent = String(results.timeSavingsPotential);
    elements.resultRoi.textContent = String(results.roiEstimate);
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
    elements.result.scrollIntoView({ behavior: "smooth", block: "start" });
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
