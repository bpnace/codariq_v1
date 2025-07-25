# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Zynapse Landing Page** - a high-converting, Astro-powered marketing website targeting German Mittelstand companies. The project aims for ≥4% qualified-lead conversion rate with strict performance and accessibility requirements.

**Tech Stack:** Astro v4 + Tailwind CSS 3.5 + Vite 5 + Node.js 18 LTS

## Development Commands

```bash
# Development
npm run dev              # Start dev server (localhost:4321)
npm run build           # Build for production (outputs to dist/)
npm run preview         # Preview production build locally

# Quality Assurance
npm run test           # Full test suite (vitest + playwright + axe + lighthouse)
npm run lint           # ESLint + Prettier
npm run format         # Auto-fix formatting

# Node.js Management
volta install node@18   # Install Node.js 18 LTS via Volta
```

## Architecture & Code Organization

### Component Structure

All components follow Astro's `.astro` format with zero-JS by default. Use `client:idle` sparingly (≤5kB total JS budget).

**Landing Page Sections (8 total):**

1. `Hero.astro` - Dual CTA buttons + lazy-loaded hero image
2. `TrustBar.astro` - TÜV/ISO/DSGVO badges (inline SVG)
3. `PainList.astro` - 3 key statistics with animated counters
4. `Benefits.astro` - 4-column features grid
5. `Testimonials.astro` - MDX-driven social proof (video + text)
6. `FAQ.astro` - Accordion pattern using `<details>` (no JS)
7. `Process.astro` - 4-step timeline with inline SVG icons
8. `FinalCTA.astro` - Conversion-focused call-to-action

### Layout System

- `src/layouts/Base.astro` - Main layout shell with header/footer
- All components must be serializable for Astro's partial hydration
- Use slots for content flexibility

### Styling Approach

- **Tailwind CSS 3.5** with custom configuration
- **Color Scheme:** Primary #1E3A8A, Secondary #059669, Accent #EA580C
- **Typography:** Serif fonts for headlines (h1-h3), Sans-serif for body
- **Accessibility:** Minimum 4.5:1 contrast ratio, focus rings, ARIA labels

## Performance Requirements

### Core Web Vitals Budgets

- **LCP:** ≤ 1.8s
- **INP:** ≤ 200ms
- **CLS:** ≤ 0.05
- **JavaScript Bundle:** ≤ 100kB

### Optimization Strategies

- Use `astro-compress` for automatic AVIF/WebP output
- lazy-load images below the fold
- Inline critical SVGs for trust badges/icons
- Minimize client-side JavaScript (prefer `<details>` over JS accordions)

## Testing Requirements

### Coverage Thresholds

- **Unit Tests:** >95% coverage for utilities (Vitest)
- **Component Tests:** All critical props & ARIA roles (Testing Library)
- **E2E Tests:** Hero CTA, form submission, ROI calculator (Playwright)
- **Accessibility:** 0 violations (axe-core + manual testing)
- **Visual Regression:** <0.1% pixel difference (Percy)

### Test Commands

```bash
npm run test           # Run all test suites
npm run test:unit      # Vitest only
npm run test:e2e       # Playwright only
npm run test:a11y      # Accessibility tests
```

## Content & Localization

### German Language Requirements

- All copy must be in German (no anglicisms in CTAs)
- Use formal "Sie" addressing throughout
- Emphasize DSGVO compliance and German data centers
- Highlight "Mittelstand" positioning

### SEO & Structured Data

- Include Schema.org JSON-LD for FAQPage, Organization, Service
- Generate sitemap.xml via Astro plugin
- Optimize for German search terms around "KI-Automatisierung"

## Deployment & Hosting

### Production Deployment (Strato Web Hosting)

```bash
# Manual deployment
npm run build
scp -r dist/* u123456@ssh.strato.de:/htdocs/

# Automated via GitHub Actions
# Uses appleboy/ssh-action to deploy on main branch push
```

### Environment Secrets

Required in GitHub repository settings:

- `STRATO_HOST` - SSH hostname
- `STRATO_USER` - SSH username
- `STRATO_PASS` - SSH password
- `PLAUSIBLE_DOMAIN` - Analytics domain
- `VWO_TOKEN` - A/B testing token
- `DEBUGBEAR_API_KEY` - Performance monitoring

## Quality Gates

### Pre-commit Requirements

- ESLint passes with no errors
- Prettier formatting applied
- All tests pass locally
- Accessibility audit clean

### CI/CD Pipeline

1. Lint & Format check
2. Build verification
3. Full test suite
4. Lighthouse CI (enforce budgets)
5. Deploy preview
6. Performance regression check

## A/B Testing Strategy

### Planned Experiments

1. Hero headline (Problem vs. Benefit wording)
2. CTA copy ("Demo anfragen" vs. "Strategiegespräch")
3. Trust badge placement (Header vs. Hero)

### Implementation Notes

- Use VWO for experiment delivery
- Track conversions via Plausible (cookieless)
- Monitor performance impact via DebugBear

## Security & Compliance

### DSGVO Requirements

- Use cookieless analytics (Plausible preferred over GA4)
- Optional VWO consent with explicit opt-in banner
- Host in EU data centers (Frankfurt)
- Document compliance in `/docs/compliance`

### Security Headers

```apache
# Required in .htaccess
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' vwo.com
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
```

## Development Workflow

### Branch Strategy

- `main` - Production branch (auto-deploys to Strato)
- `develop` - Integration branch
- `feature/*` - Feature branches (require PR review)

### Code Review Process

- All PRs require approval before merge
- Lighthouse CI must pass (100/100/100/100 scores)
- No accessibility violations allowed
- Performance budgets enforced

### Monitoring & Alerts

- DebugBear RUM for Core Web Vitals tracking
- Plausible for conversion rate monitoring
- Cloudflare Health Checks for uptime
- Alerts sent to #web-alerts Slack channel
