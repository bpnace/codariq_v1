# Codariq Landing Page

> **High-converting Astro-powered landing page positioning Codariq as "KI-Automatisierungsexperte für den deutschen Mittelstand"**

[![Performance](https://img.shields.io/badge/Lighthouse-100%2F100%2F100%2F100-brightgreen)]()
[![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-blue)]()
[![Compliance](https://img.shields.io/badge/DSGVO-Compliant-green)]()

## 🎯 Project Overview

**Goal:** Build and launch a high-converting marketing website that achieves ≥4% qualified-lead conversion rate (stretch: 6%).

### Key Metrics & Targets

- **LCP:** ≤ 1.8s
- **INP:** ≤ 200ms
- **CLS:** ≤ 0.05
- **JavaScript Bundle:** ≤ 100kB
- **Accessibility:** WCAG 2.1 AA compliance
- **Launch Timeline:** 8 weeks from kickoff

## 🚀 Quick Start

### Prerequisites

- **Node.js 18 LTS** (managed via Volta)
- **Git** for version control
- **GitHub account** for repository management

### 1. Initial Setup

```bash
# Clone the repository
git clone git@github.com:codariq/codariq-landing.git
cd codariq-landing

# Install Node.js 18 LTS via Volta
volta install node@18

# Install dependencies
npm ci
```

### 2. Development Commands

```bash
# Start development server
npm run dev              # → localhost:4321

# Build for production
npm run build           # → outputs to dist/

# Preview production build
npm run preview         # → test build locally

# Run all tests
npm run test           # → vitest + playwright + axe + lighthouse

# Lint and format
npm run lint           # → ESLint + Prettier
npm run format         # → Auto-fix formatting
```

### 3. Project Structure

```
codariq-landing/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Hero.astro      # Main hero section
│   │   ├── TrustBar.astro  # Trust badges (TÜV, ISO, DSGVO)
│   │   ├── Benefits.astro  # 4-column features grid
│   │   ├── Testimonials.astro # Social proof section
│   │   ├── FAQ.astro       # Accordion-style FAQ
│   │   ├── Process.astro   # 4-step timeline
│   │   └── FinalCTA.astro  # Conversion-focused CTA
│   ├── layouts/
│   │   └── Base.astro      # Main layout with header/footer
│   ├── pages/
│   │   └── index.astro     # Landing page
│   └── styles/
│       └── global.css      # Global styles & Tailwind
├── public/                 # Static assets
├── dist/                   # Build output (generated)
└── docs/                   # Documentation & compliance
```

## 🛠️ Development Workflow

### Phase 1: Project Setup (Week 1)

- [x] Repository creation and initial scaffold
- [x] Node.js 18 LTS with Volta
- [x] Astro + Tailwind CSS configuration
- [x] ESLint + Prettier setup
- [x] Husky pre-commit hooks
- [x] GitHub Actions CI/CD pipeline

### Phase 2: UI Foundation (Week 2)

- [ ] Design system implementation in Figma
- [ ] Tailwind configuration with custom fonts
  - **Serif fonts:** Headlines (h1-h3)
  - **Sans-serif fonts:** Body text
- [ ] Color scheme setup:
  - **Primary:** #1E3A8A (blue)
  - **Secondary:** #059669 (green)
  - **Accent:** #EA580C (orange)
- [ ] Layout shell with header/footer
- [ ] Accessibility tokens (4.5:1 contrast, focus rings)

### Phase 3: Section Implementation (Weeks 3-4)

#### Landing Page Sections (8 total):

1. **Hero Section** (`Hero.astro`)
   - Dual CTA buttons
   - Headline + subtitle
   - Lazy-loaded hero image

2. **Trust Bar** (`TrustBar.astro`)
   - TÜV, ISO, DSGVO badges
   - Inline SVG for crisp rendering

3. **Pain Points** (`PainList.astro`)
   - 3 key statistics with animated counters
   - Problem identification

4. **Solution/Benefits** (`Benefits.astro`)
   - 4-column features grid
   - Core value propositions

5. **Social Proof** (`Testimonials.astro`)
   - MDX-driven testimonials
   - Support for video & text formats

6. **FAQ Section** (`FAQ.astro`)
   - Accordion pattern using `<details>`
   - No JavaScript required

7. **Process Steps** (`Process.astro`)
   - 4-step timeline visualization
   - Inline SVG icons

8. **Final CTA** (`FinalCTA.astro`)
   - Conversion-focused call-to-action
   - Emphasizes free strategy consultation

### Phase 4: Content & SEO (Week 5)

- [ ] German copy finalization (no anglicisms in CTAs)
- [ ] SEO meta tags (title, description, OpenGraph)
- [ ] Sitemap.xml generation
- [ ] Schema.org structured data (FAQPage, Organization, Service)
- [ ] Analytics integration (Plausible or GA4 with DSGVO compliance)
- [ ] VWO A/B testing setup

### Phase 5: Testing & Optimization (Weeks 6-7)

#### Test Coverage Requirements:

- **Unit Tests:** >95% coverage for utilities (Vitest)
- **Component Tests:** All critical props & ARIA roles (Testing Library)
- **E2E Tests:** Hero CTA, form submission, ROI calculator (Playwright)
- **Performance:** All budgets met on 3G Fast (Lighthouse CI + DebugBear)
- **Accessibility:** 0 violations (axe-core + manual NVDA/VoiceOver)
- **Visual Regression:** <0.1% pixel difference (Percy)

### Phase 6: Launch & Deployment (Week 8)

- [ ] Deploy to Cloudflare Pages or Vercel
- [ ] DNS cutover with 15-min TTL fallback
- [ ] Production smoke testing
- [ ] Launch checklist sign-off
- [ ] Documentation handover

## 📊 Performance Monitoring

### Key Metrics Dashboard:

| Metric     | Tool                     | Alert Threshold        |
| ---------- | ------------------------ | ---------------------- |
| LCP        | DebugBear RUM            | ≥2s (mobile p75)       |
| INP        | DebugBear RUM            | ≥200ms (mobile p75)    |
| Uptime     | Cloudflare Health Checks | <99.9% monthly         |
| Conversion | VWO + Plausible          | Δ>±0.5% week-over-week |

## 🚢 Deployment

### Strato Web Hosting (Production)

#### Prerequisites:

- Strato "PowerWeb Plus" plan minimum
- SSH/SFTP enabled in control panel
- Let's Encrypt SSL activated

#### Manual Deployment:

```bash
# Build the project
npm run build

# Upload via SFTP
scp -r dist/* u123456@ssh.strato.de:/htdocs/
```

#### Automated Deployment (GitHub Actions):

```yaml
# .github/workflows/deploy.yml
name: Deploy to Strato
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy via SFTP
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STRATO_HOST }}
          username: ${{ secrets.STRATO_USER }}
          password: ${{ secrets.STRATO_PASS }}
          script: |
            rm -rf ~/htdocs/*
            mkdir -p ~/htdocs
            cp -r dist/* ~/htdocs/
```

#### Post-Deployment Checklist:

- [ ] Verify `/robots.txt` and `/sitemap.xml` are accessible
- [ ] Run Core Web Vitals test via PageSpeed Insights
- [ ] Confirm DSGVO compliance elements load properly
- [ ] Test all CTAs and form submissions

## 🧪 A/B Testing Strategy

### Planned Experiments (Post-Launch):

1. **Hero Headline:** Problem-focused vs. Benefit-focused wording
2. **CTA Copy:** "Demo anfragen" vs. "Strategiegespräch"
3. **Trust Badge Placement:** Header vs. Hero section

### Testing Tools:

- **VWO:** For experiment setup and variant delivery
- **Plausible:** For cookieless conversion tracking
- **DebugBear:** For performance impact monitoring

## 🔒 Security & Compliance

### Data Privacy (DSGVO):

- Cookieless analytics (Plausible preferred)
- Optional VWO consent with explicit opt-in
- EU data centers (Frankfurt) for hosting

### Security Headers:

```apache
# .htaccess
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' vwo.com"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set X-Frame-Options "DENY"
```

### Dependencies:

- Weekly `npm audit` via Renovate bot
- No critical vulnerabilities allowed in production

## 📚 Technology Stack

### Core Technologies:

- **Framework:** Astro v4 (static site generation)
- **Styling:** Tailwind CSS 3.5
- **Build Tool:** Vite 5
- **Node.js:** v18 LTS (managed via Volta)

### Testing & Quality:

- **Unit Testing:** Vitest
- **Component Testing:** Testing Library
- **E2E Testing:** Playwright
- **Accessibility:** axe-core
- **Visual Regression:** Percy
- **Performance:** Lighthouse CI

### Analytics & Optimization:

- **Analytics:** Plausible (DSGVO-compliant)
- **A/B Testing:** VWO
- **Performance Monitoring:** DebugBear
- **Design System:** Figma + Storybook

### Deployment & Hosting:

- **Hosting:** Strato Web Hosting (production)
- **CDN:** Cloudflare (optional)
- **CI/CD:** GitHub Actions
- **SSL:** Let's Encrypt (via Strato)

## 🤝 Contributing

### Development Process:

1. **Daily Standup:** Async in #landing-daily Slack thread
2. **Sprint Review:** Fridays 14:00 CET via Google Meet
3. **Decision Records:** ADR template in `/docs/adr/`

### Code Standards:

- ESLint + Prettier for consistent formatting
- Husky pre-commit hooks for quality gates
- All components must pass accessibility audit
- Performance budgets enforced in CI

---

## 📞 Support

For questions about this project:

- **Technical Issues:** Create GitHub issue
- **Business Questions:** Contact project stakeholders
- **Performance Alerts:** #web-alerts Slack channel

---

_Built with ❤️ for the German Mittelstand • © 2025 Codariq_
