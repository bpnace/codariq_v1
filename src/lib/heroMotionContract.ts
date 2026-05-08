export type HeroConsoleSnapshotId = "morning" | "crm-review" | "support-ready";
export type HeroPipelineSlot = "inbox" | "drafts" | "decisions";

export type HeroPipelineItem = {
  slot: HeroPipelineSlot;
  label: string;
  value: string;
  state: string;
};

export type HeroAlertState = {
  label: string;
  title: string;
  copy: string;
};

export type HeroConsoleState = {
  id: HeroConsoleSnapshotId;
  clock: string;
  savedTime: string;
  pipeline: readonly HeroPipelineItem[];
  liveSource: string;
  liveCopy: string;
  alert?: HeroAlertState;
};

export const HERO_CONSOLE_MOTION_VERSION = "hero-console-motion:v1";

export const HERO_CONSOLE_SELECTORS = {
  root: "[data-hero-agent-console]",
  entrance: "[data-hero-entrance]",
  statusCard: "[data-hero-status-card]",
  progressRing: "[data-hero-progress-ring]",
  clock: "[data-hero-clock]",
  savedTime: "[data-hero-saved-time]",
  alert: "[data-hero-alert]",
  alertLabel: "[data-hero-alert-label]",
  alertTitle: "[data-hero-alert-title]",
  alertCopy: "[data-hero-alert-copy]",
  liveItem: "[data-hero-live-item]",
  liveRow: "[data-hero-live-row]",
  liveSource: "[data-hero-live-source]",
  liveCopy: "[data-hero-live-copy]",
  pipelineCard: "[data-hero-pipeline-card]",
  pipelineLabel: "[data-hero-pipeline-label]",
  pipelineValue: "[data-hero-pipeline-value]",
  pipelineState: "[data-hero-pipeline-state]",
} as const;

export const HERO_CONSOLE_TIMING = {
  initialUpdateHold: 4.75,
  repeatingUpdateHold: 2.25,
} as const;

export const HERO_CONSOLE_STATES = [
  {
    id: "morning",
    clock: "08:15 Uhr",
    savedTime: "4,6 Std.",
    pipeline: [
      {
        slot: "inbox",
        label: "Erledigt",
        value: "23 E-Mails sortiert",
        state: "ohne Rückfrage",
      },
      {
        slot: "drafts",
        label: "Vorbereitet",
        value: "5 Antworten als Entwurf",
        state: "prüfbereit",
      },
      {
        slot: "decisions",
        label: "Priorisiert",
        value: "2 Entscheidungen offen",
        state: "Chef-Fokus",
      },
    ],
    liveSource: "Posteingang",
    liveCopy: "Anfragen erkannt und priorisiert",
  },
  {
    id: "crm-review",
    clock: "08:16 Uhr",
    savedTime: "5,1 Std.",
    pipeline: [
      {
        slot: "inbox",
        label: "Erledigt",
        value: "31 E-Mails sortiert",
        state: "gebündelt",
      },
      {
        slot: "drafts",
        label: "Vorbereitet",
        value: "7 Antworten als Entwurf",
        state: "Ton geprüft",
      },
      {
        slot: "decisions",
        label: "Priorisiert",
        value: "3 Entscheidungen offen",
        state: "Freigabe nötig",
      },
    ],
    liveSource: "CRM",
    liveCopy: "Lead-Kontext ergänzt",
    alert: {
      label: "Freigabe nötig",
      title: "Rabatt-Anfrage prüfen",
      copy: "Agent stoppt vor dem Versand und wartet auf deine Entscheidung.",
    },
  },
  {
    id: "support-ready",
    clock: "08:17 Uhr",
    savedTime: "5,4 Std.",
    pipeline: [
      {
        slot: "inbox",
        label: "Erledigt",
        value: "42 E-Mails sortiert",
        state: "priorisiert",
      },
      {
        slot: "drafts",
        label: "Vorbereitet",
        value: "9 Antworten als Entwurf",
        state: "prüfbereit",
      },
      {
        slot: "decisions",
        label: "Priorisiert",
        value: "1 Entscheidung offen",
        state: "Chef-Fokus",
      },
    ],
    liveSource: "Support",
    liveCopy: "Antwort mit Verlauf vorbereitet",
  },
] as const satisfies readonly HeroConsoleState[];

export const HERO_CONSOLE_INITIAL_STATE = HERO_CONSOLE_STATES[0];
