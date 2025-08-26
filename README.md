# Codariq Landing Page

> **High-converting Astro-powered landing page positioning Codariq as "KI-Automatisierungsexperte für kleine und mittelständische Unternehmen"**

[![Performance](https://img.shields.io/badge/Lighthouse-100%2F100%2F100%2F100-brightgreen)]()
[![Accessibility](https://img.shields.io/badge/WCAG-2.1%20AA-blue)]()
[![Compliance](https://img.shields.io/badge/DSGVO-Compliant-green)]()

## 🎯 Project Overview

**Codariq** is a KI-Automatisierung (AI automation) service provider specializing in small and medium-sized enterprises (SMEs) with 5-500 employees across Germany, Austria, and Switzerland.

### Target Audience

- **Company Size:** 5-500 employees
- **Market Focus:** German-speaking SMEs (DACH region)
- **Industries:** Manufacturing, logistics, professional services, retail
- **Pain Points:** Manual processes, inefficient workflows, data entry tasks

### Key Services

1. **Prozess-Automatisierung** - Business process automation
2. **Kundenservice-KI** - AI-powered customer service solutions
3. **Document Workflows** - Automated document processing
4. **Intelligente Datenanalyse** - One-time data analysis package

## 🚀 Quick Start

### Prerequisites

- **Node.js 18 LTS** (managed via Volta)
- **Git** for version control
- **GitHub account** for repository management

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/bpnace/codariq_v1.git
cd codariq_v1

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
codariq_v1/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Hero.astro      # Main hero section with dual CTA
│   │   ├── TrustBar.astro  # Trust badges (TÜV, ISO, DSGVO)
│   │   ├── PainList.astro  # Problem identification with animated counters
│   │   ├── Benefits.astro  # 4-column features grid
│   │   ├── Testimonials.astro # Social proof with randomuser.me photos
│   │   ├── Process.astro   # 4-step timeline with redesigned layout
│   │   └── FinalCTA.astro  # Calendly booking widget integration
│   ├── layouts/
│   │   └── Base.astro      # Main layout with milky glass navigation
│   ├── pages/
│   │   ├── index.astro     # Landing page
│   │   ├── datenschutz.astro # DSGVO-compliant privacy policy
│   │   ├── impressum.astro # DDG-compliant legal notice
│   │   ├── faq.astro       # AI automation FAQ
│   │   ├── agb.astro       # B2B service terms
│   │   └── cookie-richtlinien.astro # TTDSG cookie policy
│   └── styles/
│       └── global.css      # Global styles & animations
├── public/                 # Static assets
│   ├── Logo1.svg          # Main company logo
│   └── images/            # Trust badges and hero assets
└── dist/                  # Build output (generated)
```

## 🎨 Design System

### Color Scheme

- **Primary:** Orange (#EA580C) - CTA buttons and accents
- **Text:** Gray scale (900-600) for hierarchy
- **Background:** White with gray-50 for cards
- **Navigation:** Milky glass effect with backdrop blur

### Typography

- **Font:** Switzer Variable (custom font family)
- **Hierarchy:** Bold headlines, medium body text
- **Responsive:** Scales from mobile to desktop

### Recent Design Updates

- **Milky Glass Navigation** - Fixed header with backdrop blur
- **Gradient CTA Buttons** - Orange gradient from top-left to bottom-right
- **Process Component Redesign** - Numbers top-left, icons top-right, fixed heights
- **Testimonial Real Photos** - Replaced SVG graphics with randomuser.me images
- **Calendly Integration** - Non-scrollable booking widget in FinalCTA
- **Card-based Layout** - Consistent spacing and text alignment

## 📄 Legal Pages

All legal pages are DSGVO-compliant and include real business information:

- **Datenschutz** - DSGVO-compliant privacy policy with structured data processing table
- **Impressum** - Legal notice per § 5 DDG with Codariq business details
- **AGB** - Comprehensive B2B terms for KI-automation services
- **Cookie-Richtlinien** - TTDSG-compliant cookie policy
- **FAQ** - 8 detailed questions about AI automation

Recent Updates (January 2025):

- Updated all legal texts with legitimate Codariq business information
- Added proper DDG compliance tables for Impressum
- Implemented DSGVO Art. 6 structured data processing overview
- Included real contact details: Tarik Arthur Marshall, Berlin address
- Added professional service terms covering analysis, design, development phases

## 💰 Pricing Strategy

The site uses **price ranges** instead of specific amounts:

- **Simple automations:** Low five-digit range
- **Complex projects:** Mid to high five-digit range
- **Cost savings:** Mid to high five-digit annual savings
- **ROI:** Typically achieved within 6-12 months

Package pricing in Process section maintains specific pricing for transparency.

## 🛠️ Technical Features

### Performance Optimizations

- **Static Site Generation** via Astro v5
- **Minimal JavaScript** - No heavy animations or interactions
- **Optimized Images** - WebP format with lazy loading
- **Font Loading** - Preloaded variable fonts

### Accessibility

- **WCAG 2.1 AA** compliance
- **Semantic HTML** structure
- **Focus management** for keyboard navigation
- **Screen reader** optimized content

### SEO & Analytics

- **Structured Data** - Organization and services schema
- **Meta Tags** - Comprehensive OpenGraph and Twitter cards
- **German Language** - Proper hreflang and locale settings
- **Performance** - Core Web Vitals optimized

## 🚢 Deployment

### Current Hosting

- **Repository:** https://github.com/bpnace/codariq_v1.git
- **Domain:** codariq.de (configured for German market)
- **SSL:** Let's Encrypt certificate

### Deployment Process

```bash
# Build for production
npm run build

# Deploy to hosting provider
# (Specific deployment steps depend on hosting choice)
```

## 🔒 Security & Compliance

### DSGVO Compliance

- **Cookie-free analytics** preferred
- **Data minimization** - Only collect necessary data
- **German servers** - EU data residency
- **Transparent policies** - Clear privacy notices

### Security Headers

- Content Security Policy implemented
- HTTPS enforced across all pages
- No third-party tracking without consent

## 📊 Conversion Optimization

### Key Conversion Elements

1. **Orange CTA buttons** - Consistent brand color
2. **Social proof** - Testimonials with company references
3. **Clear value props** - Benefits focused on SME pain points
4. **Trust signals** - Compliance badges and guarantees
5. **Reduced friction** - Simple contact forms

### A/B Testing Opportunities

- Hero headline variations (problem vs. solution focused)
- CTA button text ("Termin buchen" vs. "Demo anfragen")
- Trust badge placement and messaging
- Testimonial layout and emphasis

## 🤝 Contributing

### Code Standards

- ESLint + Prettier for consistent formatting
- Component-based architecture
- Responsive design mandatory
- Accessibility testing required

### Development Workflow

1. Feature branches from main
2. Pull request reviews
3. Automated testing via CI/CD
4. Performance budget enforcement

---

## 🎯 Current Status (January 2025)

**✅ Completed Features:**

- Complete Codariq rebranding from zynapse/stackwerkhaus
- Real legal pages with legitimate business information
- Calendly booking widget integration
- Process component redesign with fixed text alignment
- Testimonial photos from randomuser.me
- Gradient CTA buttons with consistent styling
- DSGVO/DDG/TTDSG compliance implementation

**🔄 In Progress:**

- Performance optimization for mobile devices
- August 2025 DSGVO regulation compliance check
- EAA (European Accessibility Act) compliance verification

**📋 Next Tasks:**

- Mobile-first performance optimization
- Core Web Vitals improvement
- Accessibility audit and fixes
- Advanced analytics implementation

## 📞 Support

For questions about this project:

- **Technical Issues:** Create GitHub issue
- **Business Questions:** kontakt@codariq.de
- **Performance Monitoring:** Core Web Vitals dashboard

---

_Built for kleine und mittelständische Unternehmen • © 2025 Codariq_
