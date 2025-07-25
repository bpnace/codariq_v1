Development Roadmap – Zynapse Landing Page (2025)

Goal: Build, launch, and continuously optimize a high‑converting, Astro‑powered landing page that positions Zynapse as “KI‑Automatisierungsexperte für den deutschen Mittelstand.” The roadmap covers every step from project kickoff to post‑launch growth so the dev team can execute without ambiguity.

found at: https://github.com/bpnace/zynapse_v1.git

⸻

1 Project Overview

Item Detail
Project Type Marketing website – single‑page landing (Astro + Tailwind CSS)
Primary KPI Qualified‑lead conversion rate ≥ 4 % (stretch 6 %)
Performance Budgets LCP ≤ 1.8 s • INP ≤ 200 ms • CLS ≤ 0.05 • JS ≤ 100 kB
Compliance Targets WCAG 2.1 AA (mandatory Jun 2025) • ISO 27001 • DSGVO
Launch Deadline T + 8 weeks (exact date to be set at kickoff)

2 Phase Timeline (Gantt‑style)

Week Phase Key Deliverables
0 Kickoff & Discovery Confirm scope, stakeholders, success metrics, content owners
1 Project Setup Git repo, branch strategy, Astro app scaffold, CI/CD skeleton
2 Global UI Foundation Tailwind config, color tokens, typography, layout shell, design tokens in Figma
3–4 Section Implementation 8 marketing sections built & wired with MDX content slots
5 Content, SEO & Analytics Final German copy, on‑page SEO, Plausible or GA4, VWO tag
6–7 Testing & Optimization Automated tests ✓ • Lighthouse 100/100/100/100 • DebugBear baseline, A/B test plan
8 Launch & Handoff Prod deploy to Cloudflare/Vercel, run launch checklist, doc handover
9–12 Post‑Launch CRO Run first 3 A/B tests, iterate on data, monthly performance report

Tip: Treat weeks as sprints; close every ticket inside GitHub Projects.

⸻

3 Detailed Phase Breakdown

3.1 Kickoff & Discovery (Week 0) 1. Stakeholder Workshop ▸ Align on business goals, buyer personas, tone. 2. Content Audit & Gap List ▸ Inventory existing German case studies, testimonials, TÜV/ISO docs. 3. Requirements Freeze ▸ Lock MVP scope (8 sections, 7 CTAs, 3 trust badges). 4. Definition of Done ▸ Document measurable acceptance criteria for each budget & KPI.

3.2 Project Setup (Week 1)

Task Command / Resource
Create repo gh repo create zynapse-landing --public
Node 18 LTS via Volta volta install node@18
Astro scaffold npm create astro@latest zynapse-landing -- --template minimal
Install dependencies npm i -D @astrojs/tailwind @astrojs/sitemap astro-compress vite-imagetools
Prettier + ESLint npm i -D prettier eslint eslint-config-prettier
Husky pre‑commit npx husky-init && npm i -D lint-staged
GitHub Actions CI .github/workflows/ci.yml → lint ▶ build ▶ Lighthouse‑CI

3.3 Global UI Foundation (Week 2) 1. Design System in Figma ▸ Set primary #1E3A8A, secondary #059669, accent #EA580C. 2. Tailwind Config ▸ Add @tailwindcss/typography + custom fonts (Serif for h1‑h3, Sans‑Serif for body). 3. Layout Shell ▸ \_layouts/Base.astro with <Header/> + <Footer/>, passes slots. 4. Accessibility Tokens ▸ Ensure min 4.5:1 contrast, focus rings, aria‑labels. 5. Performance Hooks ▸ Configure astro-compress for automatic AVIF/WebP output.

3.4 Section Implementation (Weeks 3–4)

Order Section Core Components Notes
1 Hero Hero.astro Dual CTA buttons, headline + sub, lazy‑loaded hero image
2 Trust‑Bar TrustBar.astro TÜV, ISO, DSGVO badges inline‑SVG for sharpness
3 Pain Points PainList.astro 3 key stats (43 % etc.) with anim‑counter
4 Solution / Benefits Benefits.astro 4‑column features grid
5 Social Proof Testimonials.astro MDX‑driven, support video & text
6 Objection Handling FAQ.astro Accordion pattern, no JS thanks to <details>
7 Process Steps Process.astro 4‑step timeline, inline SVG icons
8 Final CTA FinalCTA.astro Re‑emphasize free strategy call

Component API: Keep all dynamic props serialisable to enable Astro’s partial hydration (client:idle only where needed, expect ≤ 5 kB extra JS).

3.5 Content, SEO & Analytics (Week 5)
• Copy Freeze: Verified German localization; no anglicisms in CTAs.
• SEO Meta: title, description, OpenGraph, canonical, sitemap.xml via plugin.
• Schema.org: FAQPage, Organization & Service structured data JSON‑LD.
• Analytics: Plausible self‑hosted (DSGVO) or GA4 with IP anonymization.
• VWO: Install async snippet; create experiment IDs for 3 prioritized tests.

3.6 Testing & Optimization (Weeks 6–7)

Layer Tool Threshold
Unit Vitest  > 95 % coverage for utils
Component Testing Library All critical props & ARIA roles
E2E Playwright Hero CTA, form submission, ROI‑calculator route
Performance Lighthouse CI & DebugBear All budgets met on 3G Fast
Accessibility axe‑core CI & manual NVDA/VoiceOver 0 violations
Visual Regressions Percy Pixel diff < 0.1 %

Automate all suites in ci.yml; fail build if any budget exceeded.

3.7 Launch & Handoff (Week 8) 1. Deploy to Cloudflare Pages (or Vercel) with immutable caching headers. 2. Smoke Test on prod: 404, 500 routes, contact form, ROI calculator. 3. DNS Cutover with 15‑min TTL fallback. 4. Launch Checklist Sign‑off (Product, Design, Security, Marketing). 5. Docs: Publish Storybook, architectural decision records (ADRs), and this roadmap to the wiki.

3.8 Post‑Launch CRO (Weeks 9–12)
• Run Experiments: 1. Hero headline (Problem vs. Benefit wording) 2. CTA copy (“Demo anfragen” vs. “Strategiegespräch”) 3. Trust badge placement (Header vs. Hero)
• Report: Weekly DebugBear + VWO dashboards, MTTI (mean‑time‑to‑interactive) alerts.
• Iterate: Ship winning variants, backlog next hypotheses.

⸻

4 Build Instructions (Step‑by‑Step Reference) 1. Clone & Install

git clone git@github.com:zynapse/zynapse-landing.git && cd zynapse-landing
volta install node@18
npm ci

    2.	Dev Server

npm run dev # localhost:4321

    3.	Generate Static Build

npm run build # outputs to dist/

    4.	Preview Prod Build

npm run preview # to verify build locally

    5.	Run Full Test Suite

npm run test # vitest + playwright + axe + lighthouse

    6.	CI/CD – push to main triggers:
    1.	Lint & Format → 2. Test → 3. Build → 4. Deploy preview → 5. Lighthouse CI report comment.
    7.	Secrets – set PLAUSIBLE_DOMAIN, VWO_TOKEN, DEBUGBEAR_API_KEY in repo settings.

Pro Tip: Use GitHub Environments to require manual approval before prod deploy.

⸻

5 Testing Strategy (QA‑Matrix)

Scenario Device/Browser Matrix Owner
Functional smoke Latest Chrome, Firefox, Edge, Safari (macOS & iOS) QA Lead
Mobile perf Moto G Power (Google Lighthouse) Frontend Eng
Accessibility NVDA (Windows) • VoiceOver (iOS) Accessibility Champ
Regression Automated Percy snapshots on PR DevOps

All bugs triaged in GitHub Projects with blocker, major, minor labels.

⸻

6 Security & Compliance
• Dependencies: Renovate bot + npm audit weekly; no critical vulns allowed.
• HTTP Headers: Content‑Security‑Policy, Strict‑Transport‑Security, X‑Frame‑Options: DENY.
• Data Privacy: Only cookieless analytics (Plausible), optional consent for VWO (explicit opt‑in banner).
• Hosting: EU data centers (Frankfurt) + DDoS shield.
• Audit Trail: Keep ISO 27001 evidence in /docs/compliance.

⸻

7 Performance Monitoring

Metric Tool Alert Threshold
LCP DebugBear RUM ≥ 2 s (mobile p75)
INP DebugBear RUM ≥ 200 ms (mobile p75)
Uptime Cloudflare Health Checks < 99.9 % monthly
Conversion VWO + Plausible Δ > ±0.5 % week‑over‑week

Alerts ping #web‑alerts Slack channel via webhook.

⸻

8 Governance & Communication
• Weekly Sprint Review: Fridays 14:00 CET via Google Meet.
• Daily Stand‑up: Async in #landing‑daily thread, blockers highlighted with 🚧.
• Decision Records: ADR template in /docs/adr/ → every architectural change logged.

⸻

9 Appendix – Tool Stack
• Build: Astro v4, Vite 5, Tailwind 3.5
• Testing: Vitest, Testing‑Library, Playwright, axe‑core, Percy
• CI/CD: GitHub Actions, Cloudflare Pages/Vercel
• Analytics & CRO: Plausible, VWO, DebugBear
• Design: Figma, Storybook, Lucide‑React icons

Next Steps: After stakeholder sign‑off on this roadmap, create GitHub epics and granular issues per task list above. 

⸻

© 2025 Zynapse – Internal Use Only

⸻

Technology Rationale — Astro vs Next.js

Decision Factor Astro (Chosen) Next.js (Alternative)
Page Type Fit Ideal for content‑driven landing pages that need almost no client‑side logic. Geared toward full‑blown web apps and dashboards; overkill for a static‑leaning marketing site.
Performance Defaults Zero‑JS by default; ships pure HTML + CSS unless you explicitly opt‑in to hydration. Typical Lighthouse 100/100 out‑of‑the‑box. Includes React runtime even for static pages; larger JS bundle and slower INP on low‑end devices unless heavily tuned.
Core Web Vitals LCP < 1.8 s, INP < 200 ms, CLS < 0.05 achievable without extra plugins. Requires aggressive code‑splitting, granular dynamic imports, and script strategy tweaks to reach the same numbers.
Dev Experience Markdown/MDX and component‑agnostic (.astro, React, Solid, Svelte) in one repo; shallow learning curve for content‑first teams. Familiar React ecosystem but more boilerplate (pages/app directory, getStaticProps, etc.).
Hosting Footprint Can be deployed as pre‑rendered static assets on any CDN (Cloudflare Pages, Vercel, Netlify) with no server. Often needs a Node/Edge runtime (even with output: export) for ISR/SSR features.
Maintenance Fewer moving parts → lower attack surface and simpler updates. More dependencies (React, Webpack/Turbopack, serverless adapters) → larger upgrade surface.
Accessibility Easier to keep DOM minimal, which benefits screen readers and keyboard nav. Extra div wrappers/JS markup can introduce complexity for WCAG audits.
Migration Path Supports “islands” partial hydration and can embed React components if interactive features are added later. Harder to down‑scope: always React‑first.

Conclusion: For a single‑purpose, conversion‑focused landing page, Astro yields faster load times, leaner bundles, and simpler ops. Next.js remains our go‑to for multi‑page SaaS apps, but here it would add unnecessary JS, cost, and maintenance overhead.

⸻

⸻

6 Deployment to Strato Web Hosting (Production) 1. Strato package prerequisites
• Use at least “PowerWeb Plus” plan (PHP 8.3, SSH/SFTP, free Let’s Encrypt SSL).
• Enable SSH/SFTP in the Strato control panel → Sicherheit. 2. Build output

npm run build # creates /dist with static HTML, CSS, JS, assets

    3.	Upload paths

Method Steps
WebFTP Zip dist → upload via Strato WebFTP → unpack into /htdocs or a subfolder.
SFTP/SSH scp -r dist/\* u123456@ssh.strato.de:/htdocs/
CI/CD (GitHub Actions) Use appleboy/ssh-action (or rsync) to push the dist folder on every main merge.Example workflow in .github/workflows/deploy.yml: ```yaml

    •	name: Deploy via SFTP

uses: appleboy/ssh-action@v1
with:
host: ${{ secrets.STRATO_HOST }}
username: ${{ secrets.STRATO_USER }}
password: ${{ secrets.STRATO_PASS }}
script: |
rm -rf ~/htdocs/_
mkdir -p ~/htdocs
cp -r dist/_ ~/htdocs/

4. **Domain & SSL**  
    • If the domain is registered at Strato: set the _Zielverzeichnis_ of the root domain to `/htdocs` (or chosen sub‑dir).  
    • If your domain is external: set an **A‑record** to the Strato IP given in the control panel _ODER_ use a CNAME to `u123456.stratoserver.net`.  
    • Activate **Let’s Encrypt** in the Strato UI for free HTTPS and force HTTPS with `.htaccess`:

   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

   	5.	Caching & CDN (optional)
   Add expiry headers via Apache:
   ```

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
</IfModule>

For global edge speed, you can still front the domain with Cloudflare (change nameservers) without touching Strato.

    6.	Post‑deploy smoke test

• Open /robots.txt and /sitemap.xml to verify Astro plugins generated them.
• Run DebugBear RUM snippet on prod to confirm CWV targets (LCP < 1.8 s, INP < 200 ms, CLS < 0.05).
• Verify German‑language ISO 27001 / DSGVO references load in < 200 ms from Frankfurt.

Key takeaway: Astro outputs static files, so Strato’s shared hosting serves them without a Node runtime. Automated SFTP keeps the workflow modern, and Cloudflare can be layered on later if traffic grows.

⸻

6 Deployment to Strato Web Hosting (Production) 1. Strato package prerequisites
• Use at least “PowerWeb Plus” plan (PHP 8.3, SSH/SFTP, free Let’s Encrypt SSL).
• Enable SSH/SFTP in the Strato control panel → Sicherheit. 2. Build output

npm run build # creates /dist with static HTML, CSS, JS, images

    3.	One‑click / manual upload

Method Steps
WebFTP Zip dist → upload via Strato WebFTP → unpack into /htdocs or subfolder.
SFTP/SSH scp -r dist/\* u123456@ssh.strato.de:/htdocs/
CI/CD (GitHub Actions) Use appleboy/ssh-action (or AEnterprise/ssh-deploy) to SFTP/rsync the dist folder on push to main.

    4.	Domain & SSL

• If the domain lives at Strato: set the “Zielverzeichnis” of the domain in the control panel to /htdocs (or the chosen subfolder).
• If the domain is external: point an A‑record to your Strato IPv4 address or a CNAME to the Strato system domain.
• Activate Let’s Encrypt in Strato → SSL Verwaltung to obtain HTTPS; force HTTPS with an .htaccess rule:

RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.\*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    5.	Caching & CDN (optional)

Astro’s output is static; configure classic Apache mod_expires inside .htaccess:

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
</IfModule>

For global edge caching you can still add Cloudflare in front of Strato by changing the domain’s nameservers.

    6.	Post‑deploy smoke test

• Load the live site through pagespeed.web.dev for Core Web Vitals.
• Ensure the DebugBear RUM snippet displays real‑user metrics from production.
• Run npx astro check --site=https://your‑domain.de to verify all routes.
