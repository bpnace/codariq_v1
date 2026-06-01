const siteUrl = "https://codariq.de";

export const engpassRoutes = {
  terminmappe: "/ki-terminvorbereitung",
  teamwissen: "/ki-wissensmanagement",
  anfragen: "/ki-anfragebearbeitung",
  entscheidungen: "/ki-entscheidungsgrundlage",
  chefUeberblick: "/ki-management-reporting",
  unterlagen: "/ki-dokumentenablage",
} as const;

type SeoCard = {
  title: string;
  text: string;
};

type SeoStep = {
  title: string;
  text: string;
  items?: string[];
};

type SeoLink = {
  href: string;
  label: string;
  text: string;
};

type SeoFaq = {
  question: string;
  answer: string;
  category?: string;
};

export type EngpassLandingPage = {
  slug: string;
  title: string;
  description: string;
  keywords: string;
  breadcrumbName: string;
  breadcrumbUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCTA: string;
  secondaryCTA: string;
  secondaryCTALink: string;
  introEyebrow: string;
  introTitle: string;
  introText: string;
  cards: SeoCard[];
  processEyebrow: string;
  processTitle: string;
  processText: string;
  steps: SeoStep[];
  proofTitle: string;
  proofText: string;
  proofItems: SeoCard[];
  linksTitle: string;
  links: SeoLink[];
  faqs: SeoFaq[];
  finalTitle: string;
  finalDescription: string;
};

const buildUrl = (path: string) => `${siteUrl}${path}`;

export const engpassLandingPages: EngpassLandingPage[] = [
  {
    slug: "ki-terminvorbereitung",
    title:
      "KI-Terminvorbereitung: Kundentermine automatisch vorbereiten | codariq",
    description:
      "KI-Agent für Terminvorbereitung: Mails, Notizen, offene Punkte und Unterlagen zu einer Terminmappe bündeln, mit Quellen, Freigaben und CRM-Übergabe.",
    keywords:
      "Terminmappe KI, KI Gesprächsvorbereitung, Meeting Briefing KI, Kundentermin vorbereiten, KI Agent Postfach, CRM Terminvorbereitung, Unterlagen vor Gespräch bündeln",
    breadcrumbName: "KI-Terminvorbereitung",
    breadcrumbUrl: buildUrl(engpassRoutes.terminmappe),
    heroTitle: "KI-Terminvorbereitung für Kundengespräche",
    heroSubtitle:
      "Ein Agent bündelt letzte Mails, Notizen, offene Punkte und fehlende Unterlagen, damit Kundentermine mit vorbereitetem Kontext starten und nicht mit fünf Suchfenstern.",
    primaryCTA: "Terminmappe prüfen",
    secondaryCTA: "Agent-Check starten",
    secondaryCTALink: "/agent-readiness",
    introEyebrow: "Gesprächsvorbereitung",
    introTitle: "Der Engpass entsteht vor dem Termin",
    introText:
      "Viele Gespräche starten nicht schlecht, weil Fachwissen fehlt. Sie starten zäh, weil Informationen aus Postfach, CRM, Dateien und Notizen zusammengesucht werden müssen.",
    cards: [
      {
        title: "Kontext aus mehreren Quellen",
        text: "Der Agent liest freigegebene Mails, Notizen, CRM-Felder und Dateien und bereitet daraus einen kompakten Gesprächsstand vor.",
      },
      {
        title: "Offene Punkte vorab sichtbar",
        text: "Fehlende Unterlagen, offene Rückfragen und blockierte Aufgaben werden markiert, bevor das Gespräch beginnt.",
      },
      {
        title: "Freigabe statt Blindversand",
        text: "Der Agent bereitet Nachfassmails oder Aufgaben vor. Externe Kommunikation bleibt im Entwurf, bis ein Mensch bestätigt.",
      },
    ],
    processEyebrow: "Vom Kalender zum Briefing",
    processTitle: "So wird aus verstreutem Kontext eine nutzbare Terminmappe.",
    processText:
      "Wir starten beim Termin selbst: Welche Quellen gehören dazu, welche Informationen werden vorab gebraucht und welche Schritte dürfen nach dem Gespräch vorbereitet werden?",
    steps: [
      {
        title: "Terminarten auswählen",
        text: "Wir grenzen ein, für welche Gespräche sich eine Terminmappe lohnt: Erstgespräch, Projektupdate, Angebot, Support-Eskalation oder Bestandskunde.",
        items: [
          "Kalenderereignis und Teilnehmer prüfen",
          "führende Quelle wie CRM oder Postfach bestimmen",
          "Erfolgskriterium vor dem Bau festlegen",
        ],
      },
      {
        title: "Quellen und Grenzen definieren",
        text: "Der Agent bekommt nur die Quellen, die für den Termin nötig sind. Sensible Informationen bekommen engere Regeln oder bleiben außen vor.",
        items: [
          "Postfach, CRM, Notizen und Dateiablage abgrenzen",
          "Zugriffe und Freigaben festlegen",
          "Fehlendes markieren und nicht erfinden",
        ],
      },
      {
        title: "Briefing testen und einführen",
        text: "Wir testen mit realen Terminen, prüfen Quellenqualität und passen die Mappe so an, dass sie im Alltag gelesen wird.",
        items: [
          "Beispiele aus realen Gesprächen",
          "Nachbereitung als Aufgabe oder Entwurf",
          "Review nach den ersten Terminen",
        ],
      },
    ],
    proofTitle: "Gute Terminvorbereitung spart Suchzeit und senkt Rückfragen.",
    proofText:
      "Der Nutzen entsteht durch einen rechtzeitig vorbereiteten Stand, der direkt vor dem Gespräch brauchbar ist.",
    proofItems: [
      {
        title: "Weniger Suchzeit",
        text: "Wichtige Unterlagen und offene Punkte liegen vor dem Termin zusammen.",
      },
      {
        title: "Bessere Nachbereitung",
        text: "Aufgaben, Entwürfe und CRM-Notizen entstehen aus dem Gesprächskontext.",
      },
      {
        title: "Kontrollierter Zugriff",
        text: "Quellen und sensible Daten werden bewusst begrenzt.",
      },
    ],
    linksTitle: "Passende Vertiefungen",
    links: [
      {
        href: "/crm-und-ki-integration",
        label: "CRM",
        text: "Wie CRM, Postfach und Kalender in einen kontrollierten Agenten-Ablauf passen.",
      },
      {
        href: engpassRoutes.anfragen,
        label: "Anfragen",
        text: "Wie neue Anfragen vor Rückruf oder Angebot eingeordnet werden.",
      },
      {
        href: "/agent-readiness",
        label: "Check",
        text: "Prüfen, ob ein Ablauf bereits agentenfähig ist.",
      },
    ],
    faqs: [
      {
        question: "Was ist eine KI-Terminmappe?",
        answer:
          "Eine KI-Terminmappe ist ein vorbereitetes Briefing für einen Termin. Sie bündelt Kontext aus Mails, CRM, Notizen und Dateien und zeigt offene Punkte, fehlende Unterlagen und mögliche nächste Schritte.",
        category: "Grundlagen",
      },
      {
        question: "Welche Termine eignen sich zuerst?",
        answer:
          "Gute Startpunkte sind Kundentermine, Erstgespräche, Projektupdates, Angebotstermine und Support-Eskalationen. Wichtig ist, dass vor jedem Termin wieder ähnliche Informationen gesucht werden.",
        category: "Eignung",
      },
      {
        question: "Kann der Agent auf mein Postfach zugreifen?",
        answer:
          "Ja, wenn es für den Ablauf nötig ist und die Zugriffe bewusst begrenzt werden. Wir legen fest, welche Postfächer, Labels, Zeiträume oder Kontakte relevant sind.",
        category: "Integration",
      },
      {
        question: "Wer entscheidet, welche Informationen in die Mappe kommen?",
        answer:
          "Das wird vor dem Bau festgelegt. Der Agent sammelt nur definierte Informationen und markiert fehlende oder unsichere Punkte, statt Inhalte zu erfinden.",
        category: "Kontrolle",
      },
      {
        question: "Kann daraus automatisch eine Nachbereitung entstehen?",
        answer:
          "Ja. Aufgaben, CRM-Notizen oder Mail-Entwürfe können vorbereitet werden. Externe Nachrichten bleiben im Freigabemodus, wenn sie eine Entscheidung oder Kundenaussage enthalten.",
        category: "Nachbereitung",
      },
      {
        question: "Wie bleibt das DSGVO-orientiert?",
        answer:
          "Wir begrenzen Quellen, Datenfelder und Speicherorte. Personenbezogene Informationen werden nur verarbeitet, wenn sie für den Termin gebraucht werden.",
        category: "Datenschutz",
      },
      {
        question: "Braucht man dafür ein neues Tool?",
        answer:
          "Nicht zwingend. Häufig reicht ein Ablauf, der bestehende Systeme wie Kalender, CRM, Postfach und Dateiablage verbindet.",
        category: "Tools",
      },
      {
        question: "Wie schnell kann ein erster Terminmappe-Pilot laufen?",
        answer:
          "Wenn Quellen und Terminart eingegrenzt sind, ist ein erster Pilot oft in wenigen Wochen möglich. Danach wird mit realen Terminen nachgeschärft.",
        category: "Umsetzung",
      },
    ],
    finalTitle: "KI-Terminvorbereitung als Agenten-Ablauf prüfen",
    finalDescription:
      "Wir schauen auf eine Terminart und prüfen, welche Quellen, Freigaben und Übergaben für eine nutzbare Terminmappe nötig sind.",
  },
  {
    slug: "ki-wissensmanagement",
    title:
      "KI-Wissensmanagement: interne Antworten mit Quellen finden | codariq",
    description:
      "KI-Agent für Teamwissen: interne Informationen aus Mails, PDFs, Tickets und Notizen auffindbar machen, mit Quellen, Freigaben und kontrolliertem Zugriff.",
    keywords:
      "Teamwissen KI, interner Wissensagent, KI Wissensmanagement, interne Fragen automatisieren, Dokumente durchsuchen KI, KI Agent Teamwissen, Wissen ohne Zuruf",
    breadcrumbName: "KI-Wissensmanagement",
    breadcrumbUrl: buildUrl(engpassRoutes.teamwissen),
    heroTitle: "KI-Wissensmanagement für interne Antworten",
    heroSubtitle:
      "Wenn Antworten in Mails, PDFs, Tickets und Köpfen verteilt sind, unterbricht jede Rückfrage den Arbeitstag. Ein Agent sucht in freigegebenen Quellen und nennt den Fundort.",
    primaryCTA: "Wissen bündeln",
    secondaryCTA: "Prozesse prüfen",
    secondaryCTALink: "/ki-integration-prozesse",
    introEyebrow: "KI-Wissensmanagement",
    introTitle: "Rückfragen sind oft ein Strukturproblem",
    introText:
      "Teamwissen fehlt selten komplett. Es liegt verteilt, veraltet oder schwer auffindbar. Der Agent findet relevante Quellen und bereitet Antwortvorschläge mit Fundort vor.",
    cards: [
      {
        title: "Quellen statt Bauchgefühl",
        text: "Antworten verweisen auf freigegebene Dokumente, Tickets, Notizen oder Mails, damit der Fundort nachvollziehbar bleibt.",
      },
      {
        title: "Weniger Unterbrechung",
        text: "Wiederkehrende Fragen werden vorbereitet, ohne dass ständig dieselben Personen angepingt werden.",
      },
      {
        title: "Zugriff bleibt begrenzt",
        text: "Teams, Rollen und sensible Quellen bekommen getrennte Berechtigungen und Freigaben.",
      },
    ],
    processEyebrow: "Wissensquellen sortieren",
    processTitle:
      "So wird aus verstreutem Wissen ein kontrollierter Antwortfluss.",
    processText:
      "Wir verbinden nicht jede Datei. Wir wählen die Quellen, nach denen dein Team heute sucht, und definieren, was der Agent beantworten darf.",
    steps: [
      {
        title: "Fragearten sammeln",
        text: "Wir erfassen, welche Fragen heute regelmäßig gestellt werden und welche Quellen dafür zählen.",
        items: [
          "Support-, Projekt- oder Onboarding-Fragen",
          "wiederkehrende Rückfragen aus dem Team",
          "Quellen mit hoher Verlässlichkeit",
        ],
      },
      {
        title: "Quellen und Rechte trennen",
        text: "Nicht jede Quelle gehört in jeden Kontext. Wir trennen Rollen, Bereiche und sensible Informationen.",
        items: [
          "Dokumente, Tickets, Notizen und Mails prüfen",
          "Zugriffe nach Rolle begrenzen",
          "veraltete Quellen markieren",
        ],
      },
      {
        title: "Antworten mit Quellen testen",
        text: "Der Agent wird mit realen Fragen geprüft. Antworten ohne brauchbare Quelle werden nicht als fertige Aussage behandelt.",
        items: [
          "Antwortqualität und Fundorte prüfen",
          "Unsicherheit sichtbar machen",
          "Freigaben für sensible Themen definieren",
        ],
      },
    ],
    proofTitle: "Teamwissen wird wertvoll, wenn es im Arbeitsfluss auftaucht.",
    proofText:
      "Der Agent ersetzt kein gepflegtes Wissensmanagement. Er macht vorhandene Informationen nutzbar und zeigt, wo Quellen fehlen oder veraltet sind.",
    proofItems: [
      {
        title: "Antworten mit Fundort",
        text: "Das Team sieht, worauf eine Antwort basiert.",
      },
      {
        title: "Weniger Wiederholung",
        text: "Standardfragen müssen nicht jedes Mal neu beantwortet werden.",
      },
      {
        title: "Bessere Pflege",
        text: "Lücken und veraltete Quellen werden im Alltag sichtbar.",
      },
    ],
    linksTitle: "Passende Vertiefungen",
    links: [
      {
        href: "/ki-integration-prozesse",
        label: "Prozesse",
        text: "Wie ein Wissensagent in bestehende Abläufe integriert wird.",
      },
      {
        href: engpassRoutes.chefUeberblick,
        label: "Überblick",
        text: "Wie offene Punkte und Freigaben für Führung vorbereitet werden.",
      },
      {
        href: "/dsgvo-ki-agenten",
        label: "Datenschutz",
        text: "Wie Rollen, Quellen und Datenflüsse bei Agenten begrenzt werden.",
      },
    ],
    faqs: [
      {
        question: "Was ist ein interner Wissensagent?",
        answer:
          "Ein interner Wissensagent sucht in freigegebenen Quellen nach passenden Informationen und bereitet Antworten mit Fundort vor. Er soll Wissen auffindbar machen, nicht neue Regeln erfinden.",
        category: "Grundlagen",
      },
      {
        question: "Welche Quellen kann der Agent nutzen?",
        answer:
          "Typisch sind Dokumente, Tickets, Wiki-Seiten, Mails, Projekttools und Notizen. Wir wählen nur Quellen aus, die für die Fragen relevant und zugänglich sein sollen.",
        category: "Quellen",
      },
      {
        question: "Kann der Agent falsche Antworten geben?",
        answer:
          "Das Risiko wird reduziert, indem Antworten Quellen nennen, Unsicherheit markieren und sensible Themen nicht ohne Prüfung abgeschlossen werden.",
        category: "Qualität",
      },
      {
        question: "Wie geht ihr mit veralteten Dokumenten um?",
        answer:
          "Veraltete oder widersprüchliche Quellen werden markiert. Der Agent kann dadurch auch zeigen, wo Wissenspflege nötig ist.",
        category: "Pflege",
      },
      {
        question: "Braucht das Team ein neues Wiki?",
        answer:
          "Nicht zwingend. Oft starten wir mit vorhandenen Quellen und prüfen erst danach, ob eine bessere Struktur oder ein Wiki gebraucht wird.",
        category: "Tools",
      },
      {
        question: "Wie bleiben vertrauliche Informationen geschützt?",
        answer:
          "Zugriffe werden nach Rolle und Quelle begrenzt. Sensible Bereiche wie HR, Finanzen oder Kundendaten bekommen eigene Regeln oder bleiben außen vor.",
        category: "Sicherheit",
      },
      {
        question: "Welche Teams profitieren zuerst?",
        answer:
          "Teams mit vielen wiederkehrenden Rückfragen, Übergaben, Dokumenten und Ticketverläufen profitieren besonders, weil Informationen im Alltag schnell gesucht werden müssen.",
        category: "Eignung",
      },
      {
        question: "Kann der Agent auch Aufgaben vorbereiten?",
        answer:
          "Ja. Wenn eine Antwort einen nächsten Schritt auslöst, kann der Agent Aufgaben, Zusammenfassungen oder Entwürfe vorbereiten. Ausführung bleibt begrenzt.",
        category: "Umsetzung",
      },
    ],
    finalTitle: "KI-Wissensmanagement als Agenten-Ablauf prüfen",
    finalDescription:
      "Wir prüfen, welche Fragen heute Zeit kosten, welche Quellen tragfähig sind und wie ein Wissensagent mit begrenztem Zugriff starten kann.",
  },
  {
    slug: "ki-anfragebearbeitung",
    title:
      "KI-Anfragebearbeitung: Leads, Rückrufe und CRM vorbereiten | codariq",
    description:
      "KI-Agent für die Anfragebearbeitung: neue Anfragen, Leads und Rückrufe einordnen, Firmendaten ergänzen, nächste Handlung vorbereiten und CRM-Freigaben erhalten.",
    keywords:
      "KI Anfragebearbeitung, Leads mit KI einordnen, CRM Agent, Rückruf vorbereiten, Anfrage automatisieren, KI Agent Vertrieb, KI CRM Integration",
    breadcrumbName: "KI-Anfragebearbeitung",
    breadcrumbUrl: buildUrl(engpassRoutes.anfragen),
    heroTitle: "KI-Anfragebearbeitung für Leads und Rückrufe",
    heroSubtitle:
      "Neue Anfragen sind selten sofort entscheidungsreif. Ein Agent ergänzt Firma, Kontakt, Kontext und nächste Handlung, bevor Rückruf, Angebot oder CRM-Aufgabe entstehen.",
    primaryCTA: "Anfragen prüfen",
    secondaryCTA: "CRM-Setup ansehen",
    secondaryCTALink: "/crm-und-ki-integration",
    introEyebrow: "KI-Anfragebearbeitung",
    introTitle: "Der Engpass liegt zwischen Eingang und nächster Handlung",
    introText:
      "Eine Anfrage kommt rein, aber Priorität, Kontext und Zuständigkeit fehlen. Genau dort kann ein Agent vorbereiten, ohne Kundendaten ungeprüft zu verändern.",
    cards: [
      {
        title: "Kontext anreichern",
        text: "Der Agent ergänzt vorhandene Kundendaten, bisherige Kontakte, offene Fragen und relevante Notizen.",
      },
      {
        title: "Nächste Handlung vorbereiten",
        text: "Rückruf, CRM-Aufgabe, Antwortentwurf oder Angebotsvorbereitung entstehen als Vorschlag.",
      },
      {
        title: "Sensible Updates prüfen",
        text: "Änderungen an CRM-Daten oder externe Nachrichten laufen im Freigabemodus.",
      },
    ],
    processEyebrow: "Von Anfrage zu Aufgabe",
    processTitle: "So wird aus Eingangskanälen ein geordneter Anfragefluss.",
    processText:
      "Wir planen, welche Informationen beim Eingang fehlen, welches System führend ist und welche Aktion der Agent nur vorbereiten darf.",
    steps: [
      {
        title: "Eingangskanäle bestimmen",
        text: "Wir prüfen, ob Anfragen aus Formular, Postfach, Telefonnotiz, LinkedIn, Shop oder Support kommen.",
        items: [
          "Quelle und Format erfassen",
          "Pflichtinformationen bestimmen",
          "führendes CRM-Objekt wählen",
        ],
      },
      {
        title: "Sortierregeln festlegen",
        text: "Der Agent sortiert nach Dringlichkeit, Umsatzbezug, Thema, Zuständigkeit oder fehlenden Angaben.",
        items: [
          "Lead, Supportfall oder Bestandskunde unterscheiden",
          "Dubletten und unvollständige Daten markieren",
          "Freigabe für Kundendaten regeln",
        ],
      },
      {
        title: "CRM-Übergabe testen",
        text: "Wir testen mit realen Anfragen, ob die vorbereiteten Aufgaben im Vertrieb oder Support helfen.",
        items: [
          "Rückrufnotiz und Antwortentwurf prüfen",
          "CRM-Felder nicht blind überschreiben",
          "Erfolg über Reaktionszeit und Nacharbeit messen",
        ],
      },
    ],
    proofTitle:
      "Gut eingeordnete Anfragen verkürzen Reaktionszeit ohne Datenchaos.",
    proofText:
      "Der Agent bereitet den nächsten menschlichen Schritt so vor, dass Vertrieb oder Support schneller entscheiden können.",
    proofItems: [
      {
        title: "Schnellere Reaktion",
        text: "Anfragen kommen mit Kontext und nächster Handlung an.",
      },
      {
        title: "Weniger CRM-Nacharbeit",
        text: "Dubletten, fehlende Daten und Zuständigkeit werden früher sichtbar.",
      },
      {
        title: "Freigaben erhalten",
        text: "Kundendaten und externe Nachrichten bleiben prüfbar.",
      },
    ],
    linksTitle: "Passende Vertiefungen",
    links: [
      {
        href: "/crm-und-ki-integration",
        label: "CRM",
        text: "Wie CRM, E-Mail und Kalender mit Freigaben verbunden werden.",
      },
      {
        href: engpassRoutes.terminmappe,
        label: "Terminmappe",
        text: "Wie aus Anfragekontext eine Gesprächsvorbereitung entsteht.",
      },
      {
        href: "/ki-agenten-kmu",
        label: "KMU",
        text: "Wie kontrollierbare Agenten für mehrere operative Abläufe aufgebaut werden.",
      },
    ],
    faqs: [
      {
        question: "Was bedeutet Anfragen mit KI einordnen?",
        answer:
          "Ein Agent liest neue Eingänge, ergänzt Kontext, schätzt Dringlichkeit ein und bereitet eine nächste Handlung vor.",
        category: "Grundlagen",
      },
      {
        question: "Kann der Agent Leads bewerten?",
        answer:
          "Ja, wenn Kriterien wie Segment, Budgetsignal, Thema, Region, Bestandskunde oder Dringlichkeit definiert sind. Die Bewertung bleibt ein Vorschlag.",
        category: "Lead-Einordnung",
      },
      {
        question: "Welche Systeme werden angebunden?",
        answer:
          "Häufig sind Postfach, Formular, CRM, Kalender, Supporttool oder Projekttool beteiligt. Wir binden nur die Systeme an, die für den Startfall nötig sind.",
        category: "Integration",
      },
      {
        question: "Darf der Agent direkt ins CRM schreiben?",
        answer:
          "Das ist möglich, aber nicht immer sinnvoll. Oft starten wir mit Vorschlägen, damit Kundendaten nicht ungeprüft überschrieben werden.",
        category: "Kontrolle",
      },
      {
        question: "Kann der Agent Antwortmails schreiben?",
        answer:
          "Er kann Entwürfe vorbereiten. Versand, Preise, Zusagen oder sensible Aussagen bleiben bei einem Menschen, wenn sie Kundenwirkung haben.",
        category: "Kommunikation",
      },
      {
        question: "Wie verhindert ihr Dubletten?",
        answer:
          "Wir prüfen führende Felder und bestehende CRM-Objekte, bevor neue Kontakte oder Aufgaben entstehen. Unsichere Treffer werden markiert.",
        category: "Datenqualität",
      },
      {
        question: "Wie wird Erfolg gemessen?",
        answer:
          "Typische Messpunkte sind Reaktionszeit, Anzahl vorbereiteter Aufgaben, weniger manuelle Recherche und weniger falsch eingeordnete Anfragen.",
        category: "ROI",
      },
      {
        question: "Eignet sich das für Selbstständige?",
        answer:
          "Ja. Gerade bei wenig Zeit kann ein Agent Anfragen vorsortieren, fehlende Angaben markieren und den nächsten Schritt vorbereiten.",
        category: "Zielgruppe",
      },
    ],
    finalTitle: "KI-Anfragebearbeitung als Agenten-Ablauf prüfen",
    finalDescription:
      "Wir prüfen, welche Anfragen heute nachrecherchiert werden müssen und wie ein Agent die nächste Handlung vorbereiten kann.",
  },
  {
    slug: "ki-entscheidungsgrundlage",
    title:
      "KI-Entscheidungsgrundlage: Freigaben und Risiken vorbereiten | codariq",
    description:
      "KI-Agent für Geschäftsführung und Freigaben: offene Entscheidungen, Blocker, Risiken und wichtige Rückmeldungen vorbereiten, ohne operative Details zu überladen.",
    keywords:
      "KI Entscheidungsgrundlage, Entscheidungen vorbereiten KI, KI Agent Geschäftsführung, Freigaben bündeln, Blocker erkennen KI, Management Briefing KI, Risiken vorbereiten",
    breadcrumbName: "KI-Entscheidungsgrundlage",
    breadcrumbUrl: buildUrl(engpassRoutes.entscheidungen),
    heroTitle: "KI-Entscheidungsgrundlage für Freigaben und Risiken",
    heroSubtitle:
      "Für Führung zählt der Stand von Freigaben, blockierten Aufgaben, wichtigen Rückmeldungen und Risiken, die nicht liegen bleiben dürfen.",
    primaryCTA: "Stand vorbereiten",
    secondaryCTA: "Projekt prüfen",
    secondaryCTALink: "/ki-projekt-retten",
    introEyebrow: "Management-Briefing",
    introTitle: "Entscheidungen hängen oft an fehlendem Kontext",
    introText:
      "Wenn Freigaben, Blocker und Rückmeldungen über Tools verteilt sind, wird jede Entscheidung zur Suchaufgabe. Ein Agent bereitet den Stand vor und markiert offene Punkte.",
    cards: [
      {
        title: "Freigaben bündeln",
        text: "Offene Freigaben aus Postfach, Projekttool oder CRM werden gesammelt und mit Kontext übergeben.",
      },
      {
        title: "Blocker sichtbar machen",
        text: "Der Agent erkennt Aufgaben, Rückmeldungen oder Dokumente, die eine Entscheidung blockieren.",
      },
      {
        title: "Risiken früher markieren",
        text: "Wichtige Eskalationen werden als prüfbarer Stand vorbereitet, ohne im Detail unterzugehen.",
      },
    ],
    processEyebrow: "Von Status zu Entscheidung",
    processTitle: "So entsteht ein Briefing, das Entscheidungen vorbereitet.",
    processText:
      "Wir definieren, welche Entscheidungen regelmäßig anstehen, welche Quellen dafür zählen und wo der Agent nur zusammenfasst statt zu handeln.",
    steps: [
      {
        title: "Entscheidungstypen erfassen",
        text: "Wir sammeln typische Freigaben, Eskalationen und Blocker, die heute im Alltag hängen bleiben.",
        items: [
          "Budget, Angebot, Priorität oder Kundenthema",
          "Sonderfälle mit Management-Relevanz",
          "nötige Quellen pro Entscheidung",
        ],
      },
      {
        title: "Statusquellen verbinden",
        text: "Der Agent liest nur relevante Quellen und bereitet den aktuellen Stand mit Fundort und Unsicherheit vor.",
        items: [
          "Postfach, CRM, Projekttool und Dateien abgrenzen",
          "Prioritäten und Fristen markieren",
          "keine Entscheidung ohne Freigabe auslösen",
        ],
      },
      {
        title: "Briefing im Alltag testen",
        text: "Wir prüfen, ob die vorbereiteten Stände für eine Entscheidung reichen oder ob Informationen fehlen.",
        items: [
          "reale Freigaben als Testfälle",
          "Review mit Führung oder Owner",
          "Ausbau erst nach Nutzung",
        ],
      },
    ],
    proofTitle: "Ein gutes Entscheidungsbriefing reduziert Rückfragen.",
    proofText:
      "Der Agent soll Entscheidungen nicht ersetzen. Er bringt die nötigen Informationen so zusammen, dass Führung schneller prüfen und entscheiden kann.",
    proofItems: [
      {
        title: "Freigaben an einem Ort",
        text: "Offene Entscheidungen werden mit Kontext vorbereitet.",
      },
      {
        title: "Risiken nicht übersehen",
        text: "Blocker und Eskalationen werden früher markiert.",
      },
      {
        title: "Weniger Statussuche",
        text: "Führung muss nicht aus mehreren Tools manuell zusammensuchen.",
      },
    ],
    linksTitle: "Passende Vertiefungen",
    links: [
      {
        href: "/ki-projekt-retten",
        label: "Projekt retten",
        text: "Wenn ein bestehender KI-Ablauf im Betrieb nicht trägt.",
      },
      {
        href: engpassRoutes.chefUeberblick,
        label: "Chef-Überblick",
        text: "Wie ein täglicher Überblick für neue Themen, Hänger und Freigaben entsteht.",
      },
      {
        href: "/ki-integration-prozesse",
        label: "Prozesse",
        text: "Wie Entscheidungen in bestehende Abläufe eingebunden werden.",
      },
    ],
    faqs: [
      {
        question: "Kann KI Entscheidungen treffen?",
        answer:
          "In diesem Setup nicht. Der Agent bereitet Informationen, Optionen und offene Punkte vor. Die Entscheidung bleibt beim verantwortlichen Menschen.",
        category: "Kontrolle",
      },
      {
        question: "Welche Entscheidungen eignen sich zuerst?",
        answer:
          "Gute Startpunkte sind wiederkehrende Freigaben, Priorisierungen, Angebotsfragen, Eskalationen oder Projektblocker mit verteiltem Kontext.",
        category: "Eignung",
      },
      {
        question: "Wie erkennt der Agent Blocker?",
        answer:
          "Über definierte Signale wie überfällige Aufgaben, fehlende Rückmeldungen, offene Freigaben, Eskalationswörter oder nicht erfüllte Pflichtinformationen.",
        category: "Signale",
      },
      {
        question: "Welche Tools werden dafür verbunden?",
        answer:
          "Typisch sind Postfach, CRM, Projekttool, Kalender, Dokumentenablage und Supportsystem. Die Auswahl richtet sich nach der Entscheidung.",
        category: "Integration",
      },
      {
        question: "Wie bleibt das Briefing knapp genug?",
        answer:
          "Wir definieren feste Felder: Stand, Risiko, offene Frage, Quelle, empfohlener nächster Schritt. Details bleiben verlinkt.",
        category: "Format",
      },
      {
        question: "Kann der Agent Freigaben nachhalten?",
        answer:
          "Ja. Er kann offene Freigaben markieren, erinnern und Aufgaben vorbereiten. Automatische Zusagen oder Ablehnungen bleiben gesperrt, wenn Verantwortung betroffen ist.",
        category: "Freigaben",
      },
      {
        question: "Wie werden Fehler vermieden?",
        answer:
          "Über Quellenangaben, begrenzte Datenzugriffe, reale Testfälle und Freigaben bei unsicheren oder sensiblen Entscheidungen.",
        category: "Qualität",
      },
      {
        question: "Für wen ist das besonders sinnvoll?",
        answer:
          "Für Geschäftsführung, Teamleads und Projektverantwortliche, die regelmäßig viele offene Punkte aus mehreren Systemen zusammenziehen müssen.",
        category: "Zielgruppe",
      },
    ],
    finalTitle: "KI-Entscheidungsgrundlage mit Agent prüfen",
    finalDescription:
      "Wir schauen auf eine wiederkehrende Freigabe oder Entscheidung und prüfen, welche Quellen und Stopps ein Agent dafür braucht.",
  },
  {
    slug: "ki-management-reporting",
    title:
      "KI-Management-Reporting: Tagesüberblick für Geschäftsführung | codariq",
    description:
      "KI-Agent für Geschäftsführung: neue Themen, offene Freigaben, blockierte Aufgaben und wichtige Rückmeldungen als Tagesstand vorbereiten.",
    keywords:
      "KI Management Reporting, Tagesbriefing KI, Geschäftsführer Agent, Freigaben bündeln KI, offene Aufgaben KI, Management Übersicht KI, Chef Überblick KI",
    breadcrumbName: "KI-Management-Reporting",
    breadcrumbUrl: buildUrl(engpassRoutes.chefUeberblick),
    heroTitle: "KI-Management-Reporting für den Tagesüberblick",
    heroSubtitle:
      "Morgens hilft eine kurze Liste: Was ist neu, was hängt, was braucht Freigabe und wo steht eine Entscheidung an?",
    primaryCTA: "Überblick prüfen",
    secondaryCTA: "Stand vorbereiten",
    secondaryCTALink: engpassRoutes.entscheidungen,
    introEyebrow: "Management-Reporting",
    introTitle: "Führung verliert Zeit, wenn Status verteilt bleibt",
    introText:
      "Viele operative Fragen sind nicht strategisch, aber sie blockieren den Tag. Ein Agent kann neue Themen und Hänger bündeln, ohne jeden Detailverlauf in ein Dashboard zu kippen.",
    cards: [
      {
        title: "Neues vom Vortag",
        text: "Wichtige Rückmeldungen, neue Anfragen und relevante Änderungen werden als Tagesstand vorbereitet.",
      },
      {
        title: "Hänger und Freigaben",
        text: "Blockierte Aufgaben und offene Entscheidungen werden nicht erst im nächsten Meeting sichtbar.",
      },
      {
        title: "Kurz statt komplett",
        text: "Der Überblick zeigt, was Handlung braucht. Details bleiben über Quellen erreichbar.",
      },
    ],
    processEyebrow: "Vom Tool-Stapel zum Tagesstand",
    processTitle: "So entsteht ein Überblick, den Führung morgens nutzt.",
    processText:
      "Wir gestalten kein Kontrollzentrum. Wir definieren die wenigen Signale, die Führung täglich braucht, und halten die Quellen nachvollziehbar.",
    steps: [
      {
        title: "Signale auswählen",
        text: "Wir bestimmen, welche Ereignisse in den Tagesstand gehören: Freigaben, Rückfragen, Fristen, Risiken, neue Leads oder Blocker.",
        items: [
          "Führungssignale statt Vollständigkeit",
          "Quellen und Prioritäten erfassen",
          "irrelevante Updates ausschließen",
        ],
      },
      {
        title: "Datenwege begrenzen",
        text: "Der Agent liest nur die Systeme, die für den Überblick nötig sind, und zeigt Fundorte für Details.",
        items: [
          "Postfach, CRM, Projekttool oder Support abgrenzen",
          "Rollen und sensible Quellen trennen",
          "Tagesstand ohne Blindaktionen",
        ],
      },
      {
        title: "Rhythmus testen",
        text: "Der Überblick wird mit realen Tagen geprüft: Was fehlt, was ist zu viel, was führt zu einer Entscheidung?",
        items: [
          "Tages- oder Wochenbriefing testen",
          "Format auf Lesbarkeit trimmen",
          "Freigaben und Erinnerungen einbauen",
        ],
      },
    ],
    proofTitle: "Ein guter Überblick spart Nachfragen und Meetings.",
    proofText:
      "Der Agent versorgt Führung nicht mit mehr Daten. Er bereitet die wenigen handlungsrelevanten Punkte rechtzeitig vor.",
    proofItems: [
      {
        title: "Weniger Nachfragen",
        text: "Status und offene Punkte liegen vor dem ersten Meeting vor.",
      },
      {
        title: "Schnellere Freigaben",
        text: "Entscheidungen kommen mit Kontext und Quelle.",
      },
      {
        title: "Mehr Fokus",
        text: "Operative Hänger werden sichtbar, ohne den Tag zu dominieren.",
      },
    ],
    linksTitle: "Passende Vertiefungen",
    links: [
      {
        href: engpassRoutes.entscheidungen,
        label: "Entscheidungen",
        text: "Wie Freigaben, Blocker und Risiken als Entscheidungsstand vorbereitet werden.",
      },
      {
        href: "/ki-agenten-kmu",
        label: "KMU",
        text: "Wie Agenten für operative Abläufe in KMU aufgebaut werden.",
      },
      {
        href: "/agent-readiness",
        label: "Check",
        text: "Prüfen, welcher Ablauf zuerst agentenfähig ist.",
      },
    ],
    faqs: [
      {
        question: "Was ist ein KI-Tagesbriefing?",
        answer:
          "Ein KI-Tagesbriefing ist eine vorbereitete Übersicht über neue Themen, offene Freigaben, Blocker und wichtige Rückmeldungen aus verbundenen Systemen.",
        category: "Grundlagen",
      },
      {
        question: "Welche Informationen gehören hinein?",
        answer:
          "Nur handlungsrelevante Punkte: neue Risiken, Freigaben, blockierte Aufgaben, wichtige Kundenrückmeldungen, Fristen oder Entscheidungen.",
        category: "Inhalt",
      },
      {
        question: "Wie unterscheidet sich das von einem Dashboard?",
        answer:
          "Ein Dashboard zeigt Daten. Das Briefing bereitet die Punkte vor, die heute Aufmerksamkeit, Freigabe oder Entscheidung brauchen.",
        category: "Einordnung",
      },
      {
        question: "Kann der Agent Erinnerungen vorbereiten?",
        answer:
          "Ja. Er kann Erinnerungen oder Aufgaben vorbereiten, wenn Freigaben fehlen oder Fristen näherkommen. Versand oder Eskalation bleibt regelbasiert begrenzt.",
        category: "Freigaben",
      },
      {
        question: "Welche Systeme sind typisch?",
        answer:
          "Postfach, CRM, Projekttool, Kalender, Supportsystem und Dokumentenablage. Die Quellen werden nach Führungssignal ausgewählt.",
        category: "Integration",
      },
      {
        question: "Wie bleibt der Überblick kurz?",
        answer:
          "Wir arbeiten mit festen Kategorien, Prioritäten und Quellenlinks. Alles ohne Entscheidung oder Hänger bleibt außerhalb des Briefings.",
        category: "Format",
      },
      {
        question: "Kann das im Team geteilt werden?",
        answer:
          "Ja, wenn Rollen und Inhalte passen. Sensible Punkte können getrennt werden, damit nicht jeder Überblick dieselben Informationen enthält.",
        category: "Rollen",
      },
      {
        question: "Wann lohnt sich so ein Agent?",
        answer:
          "Wenn Führung regelmäßig in Mails, Tools oder Meetings nach Status sucht und operative Freigaben dadurch liegen bleiben.",
        category: "Eignung",
      },
    ],
    finalTitle: "KI-Management-Reporting als Agenten-Ablauf prüfen",
    finalDescription:
      "Wir prüfen, welche Signale morgens zählen und wie ein Agent daraus einen kompakten Tagesstand vorbereiten kann.",
  },
  {
    slug: "ki-dokumentenablage",
    title: "KI-Dokumentenablage: Unterlagen und Daten vorsortieren | codariq",
    description:
      "KI-Agent für Backoffice: Listen, Rechnungen, Formulare und Unterlagen vorsortieren, Dubletten finden, fehlende Angaben markieren und Ablage vorbereiten.",
    keywords:
      "KI Dokumentenablage, Daten vorsortieren KI, Unterlagen sortieren KI, Backoffice Agent, Rechnungen vorsortieren, Formulare prüfen KI, Ablage automatisieren, Dokumentenverarbeitung KI",
    breadcrumbName: "KI-Dokumentenablage",
    breadcrumbUrl: buildUrl(engpassRoutes.unterlagen),
    heroTitle: "KI-Dokumentenablage für Unterlagen und Daten",
    heroSubtitle:
      "Listen, Rechnungen und Formulare kommen aus Postfach, Exporten und Ordnern. Ein Agent findet Dubletten, fehlende Angaben und falsche Ablageorte, bevor daraus manuelle Korrektur wird.",
    primaryCTA: "Unterlagen prüfen",
    secondaryCTA: "Prozesse prüfen",
    secondaryCTALink: "/ki-integration-prozesse",
    introEyebrow: "Backoffice-Agent",
    introTitle: "Der Engpass steckt in kleinen Prüfungen",
    introText:
      "Backoffice-Arbeit scheitert selten an einer großen Aufgabe. Es sind Dubletten, falsche Dateinamen, fehlende Angaben und unpassende Ablageorte, die jeden Tag Zeit ziehen.",
    cards: [
      {
        title: "Unterlagen erkennen",
        text: "Der Agent unterscheidet Rechnungen, Formulare, Listen, Nachweise und Anhänge und schlägt die passende Verarbeitung vor.",
      },
      {
        title: "Fehler früh markieren",
        text: "Fehlende Angaben, Dubletten oder widersprüchliche Daten werden sichtbar, bevor sie in Zielsysteme übernommen werden.",
      },
      {
        title: "Ablage vorbereiten",
        text: "Dateinamen, Ordner, Tags oder Aufgaben werden vorbereitet, ohne sensible Sonderfälle blind auszuführen.",
      },
    ],
    processEyebrow: "Vom Eingang zur geordneten Ablage",
    processTitle: "So wird Backoffice-Sortierung kontrolliert automatisiert.",
    processText:
      "Wir starten mit einem eng begrenzten Dokument- oder Datentyp und definieren, wann der Agent sortieren darf und wann ein Mensch prüft.",
    steps: [
      {
        title: "Dokumenttypen auswählen",
        text: "Wir wählen den Bereich mit hoher Wiederholung: Rechnungen, Formulare, Belege, Listen, Exportdaten oder Kundenunterlagen.",
        items: [
          "Eingangskanal und Dateityp prüfen",
          "Pflichtangaben definieren",
          "Sonderfälle sammeln",
        ],
      },
      {
        title: "Prüfregeln festlegen",
        text: "Der Agent bekommt Regeln für Vollständigkeit, Dubletten, Benennung, Zielordner und erlaubte Übergaben.",
        items: [
          "Dubletten und fehlende Felder markieren",
          "Ablage- und Benennungslogik definieren",
          "Freigaben für sensible Dokumente setzen",
        ],
      },
      {
        title: "Mit realen Unterlagen testen",
        text: "Wir testen mit realen Dokumenten, nicht mit perfekten Beispielen. Erst danach wird der Ablauf produktiv erweitert.",
        items: [
          "Trefferquote und Fehlerfälle prüfen",
          "manuelle Nacharbeit messen",
          "Betrieb und Anpassungen planen",
        ],
      },
    ],
    proofTitle: "Gute Vorsortierung reduziert Korrekturschleifen.",
    proofText:
      "Der Agent soll Dateien nicht blind verschieben. Er soll fehlende und widersprüchliche Informationen früh genug markieren, damit weniger Nacharbeit entsteht.",
    proofItems: [
      {
        title: "Weniger Dubletten",
        text: "Doppelte oder ähnliche Unterlagen werden früher erkannt.",
      },
      {
        title: "Bessere Ablage",
        text: "Dateien landen mit passender Benennung und Kontext im Zielsystem.",
      },
      {
        title: "Sonderfälle stoppen",
        text: "Unsichere Dokumente werden markiert statt blind verarbeitet.",
      },
    ],
    linksTitle: "Passende Vertiefungen",
    links: [
      {
        href: "/ki-integration-prozesse",
        label: "Prozesse",
        text: "Wie Daten- und Dokumentenflüsse in bestehende Abläufe passen.",
      },
      {
        href: "/dsgvo-ki-agenten",
        label: "Datenschutz",
        text: "Wie Datenminimierung und Freigaben bei Dokumenten-Agenten greifen.",
      },
      {
        href: "/ki-agenten-selbststaendige",
        label: "Selbstständige",
        text: "Wie Backoffice-Agenten für kleine Setups starten können.",
      },
    ],
    faqs: [
      {
        question: "Welche Unterlagen kann ein KI-Agent vorsortieren?",
        answer:
          "Typisch sind Rechnungen, Belege, Formulare, PDFs, Listen, Exportdateien, Kundenunterlagen und Anhänge aus dem Postfach.",
        category: "Use Cases",
      },
      {
        question: "Kann der Agent Daten aus PDFs auslesen?",
        answer:
          "Ja, wenn Qualität und Format passen. Der Agent kann Angaben extrahieren, Pflichtfelder prüfen und fehlende oder unsichere Werte markieren.",
        category: "Dokumente",
      },
      {
        question: "Darf der Agent Dateien automatisch ablegen?",
        answer:
          "Das kann sinnvoll sein, wenn Regeln und Sonderfälle getestet sind. Unsichere Dokumente werden zuerst markiert oder zur Freigabe übergeben.",
        category: "Kontrolle",
      },
      {
        question: "Wie werden Dubletten erkannt?",
        answer:
          "Über Felder wie Name, Datum, Rechnungsnummer, Betrag, Dateiinhalt oder ähnliche Metadaten. Unsichere Treffer werden nicht automatisch gelöscht.",
        category: "Datenqualität",
      },
      {
        question: "Kann der Agent mit Buchhaltung oder CRM verbunden werden?",
        answer:
          "Ja, wenn Schnittstellen und Rechte passen. Wir prüfen vorab, welche Daten gelesen, vorbereitet oder geschrieben werden dürfen.",
        category: "Integration",
      },
      {
        question: "Wie bleibt das DSGVO-orientiert?",
        answer:
          "Der Agent verarbeitet nur die Daten, die für Sortierung und Prüfung nötig sind. Speicherort, Anbieter, Zugriff und Freigaben werden dokumentiert.",
        category: "Datenschutz",
      },
      {
        question: "Was passiert bei schwer lesbaren Dokumenten?",
        answer:
          "Sie werden markiert und nicht blind verarbeitet. Der Ablauf sollte Fehlerfälle sichtbar machen, damit ein Mensch prüfen kann.",
        category: "Qualität",
      },
      {
        question: "Wann lohnt sich die Automatisierung?",
        answer:
          "Wenn regelmäßig ähnliche Unterlagen eingehen und heute viel Zeit für Umbenennen, Prüfen, Kopieren, Ablegen oder Nachfragen verloren geht.",
        category: "Eignung",
      },
    ],
    finalTitle: "KI-Dokumentenablage mit Agent prüfen",
    finalDescription:
      "Wir prüfen einen Dokument- oder Datenfluss und zeigen, wo ein Agent vorsortieren, markieren und mit Freigabe übergeben kann.",
  },
];

export const engpassLandingPageBySlug = new Map(
  engpassLandingPages.map((page) => [page.slug, page]),
);
