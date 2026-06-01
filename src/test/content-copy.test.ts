import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const FRONT_FACING_COPY_FILES = [
  "src/components/AgentReadinessSection.astro",
  "src/components/BlogInsightsSection.astro",
  "src/components/DeliveryProcessSection.astro",
  "src/components/FAQ.astro",
  "src/components/FAQSchema.astro",
  "src/components/HomeFAQSection.astro",
  "src/components/LandingHeroSection.astro",
  "src/components/PricingTiersSection.astro",
  "src/components/SeoContentHeroSection.astro",
  "src/components/SeoLandingPageTemplate.astro",
  "src/components/TrustSignalsSection.astro",
  "src/components/UseCaseCardsSection.astro",
  "src/components/UseCaseProofSection.astro",
  "src/data/engpassLandingPages.ts",
  "src/pages/agent-readiness.astro",
  "src/pages/crm-und-ki-integration.astro",
  "src/pages/dsgvo-ki-agenten.astro",
  "src/pages/faq.astro",
  "src/pages/index.astro",
  "src/pages/ki-agenten-gruender.astro",
  "src/pages/ki-agenten-kleine-teams.astro",
  "src/pages/ki-agenten-kmu.astro",
  "src/pages/ki-agenten-selbststaendige.astro",
  "src/pages/ki-integration-prozesse.astro",
  "src/pages/ki-projekt-retten.astro",
  "src/pages/openclaw-agenten.astro",
  "src/scripts/agent-readiness.ts",
  "src/utils/quiz.ts",
  "public/llms.txt",
  "public/manifest.json",
  "public/site.webmanifest",
];

const LANDING_PAGE_COPY_FILES = [
  "src/layouts/Base.astro",
  "src/components/FAQ.astro",
  "src/components/FAQSchema.astro",
  "src/components/LandingHeroSection.astro",
  "src/components/SeoContentHeroSection.astro",
  "src/components/SeoLandingPageTemplate.astro",
  "src/components/UseCaseProofSection.astro",
  "src/data/engpassLandingPages.ts",
  "src/pages/crm-und-ki-integration.astro",
  "src/pages/dsgvo-ki-agenten.astro",
  "src/pages/ki-agenten-gruender.astro",
  "src/pages/ki-agenten-kleine-teams.astro",
  "src/pages/ki-agenten-kmu.astro",
  "src/pages/ki-agenten-selbststaendige.astro",
  "src/pages/ki-integration-prozesse.astro",
  "src/pages/ki-projekt-retten.astro",
  "src/pages/openclaw-agenten.astro",
  "public/llms.txt",
  "public/manifest.json",
  "public/site.webmanifest",
];

const KLAR_FAMILY_PATTERN = /\b(?:klar[\p{L}-]*|klär[\p{L}-]*)/giu;
const MAX_FRONT_FACING_KLAR_FAMILY_USES = 25;
const HUMANIZER_SLOP_PATTERNS = [
  {
    label: "standalone echt-family words",
    pattern: /\b(?:echt|echte|echten|echter|echtes)\b/giu,
  },
  {
    label: "standalone dieser",
    pattern: /\bdieser\b/giu,
  },
  {
    label: "triage label",
    pattern: /\btriage\b/giu,
  },
  {
    label: "nicht-X-sondern-Y contrast formula",
    pattern: /\bnicht[^"\n.?!]{0,100}\bsondern\b/giu,
  },
  {
    label: "Die Frage ist nicht formula",
    pattern: /\bDie Frage ist nicht\b/giu,
  },
  {
    label: "Genau da kippt formula",
    pattern: /\bGenau da kippt\b/giu,
  },
  {
    label: "verschwindet-nicht formula",
    pattern: /\bverschwindet nicht\b/giu,
  },
  {
    label: "klingt trocken formula",
    pattern: /\bklingt trocken\b/giu,
  },
  {
    label: "kein-X-kein-Y-only-Z contrast formula",
    pattern: /\bKein[^.\n!?]{1,80},\s*kein[^.\n!?]{1,80}\.\s*Nur\b/giu,
  },
];

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

function countKlarFamilyUses(source: string) {
  return Array.from(source.matchAll(KLAR_FAMILY_PATTERN)).length;
}

describe("front-facing German copy", () => {
  it("keeps klar-family wording sparse outside blog articles", () => {
    const countedFiles = FRONT_FACING_COPY_FILES.map((path) => ({
      path,
      count: countKlarFamilyUses(readProjectFile(path)),
    })).filter(({ count }) => count > 0);

    const total = countedFiles.reduce((sum, file) => sum + file.count, 0);
    const details = countedFiles
      .map(({ path, count }) => `${path}: ${count}`)
      .join("\n");

    expect(
      total,
      `Avoid using klar/klär as default front-facing filler:\n${details}`,
    ).toBeLessThanOrEqual(MAX_FRONT_FACING_KLAR_FAMILY_USES);
  });

  it("keeps landing-page copy out of the humanizer slop patterns", () => {
    const findings = LANDING_PAGE_COPY_FILES.flatMap((path) => {
      const source = readProjectFile(path);

      return HUMANIZER_SLOP_PATTERNS.flatMap(({ label, pattern }) =>
        Array.from(source.matchAll(pattern)).map((match) => ({
          path,
          label,
          match: match[0],
        })),
      );
    });

    const details = findings
      .map(({ path, label, match }) => `${path}: ${label}: ${match}`)
      .join("\n");

    expect(
      findings,
      `Apply the Obsidian humanizer filter to landing-page copy:\n${details}`,
    ).toEqual([]);
  });
});
