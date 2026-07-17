# QTSI Engineering Standards v1.0

This document defines the engineering standards, architectural rules, and launch compliance baselines for the QTSI platform. Every contributor (including AI systems) must adhere strictly to these rules.

---

## 1. Brand & Design System

- **Brand Book:** Maintain the high-end institutional visual identity defined in `QTSI_Brand_Book_v2.md`.
- **Colors:**
  - Executive Navy (Primary): `#003B5C`
  - Hover Navy: `#002840`
  - Emerald Green (Secondary): `#10B981`
  - Background Base: `#FFFFFF` / `#FAFAFA`
- **Typography:** Primary font family is **Inter**. Fallbacks are native sans-serif fonts.
- **Motion:** UI transitions must use snapping curves: `200ms` to `250ms` using `ease-out` or `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 2. Frontend Standards

- **Component Design:** Build UI modules to be reusable. Standardize elements (nav, cards, buttons) across all templates.
- **Layout Margins:**
  - Containers must have a maximum width of `1200px`.
  - Layouts must be responsive and completely safe from overflow down to `320px`.
- **Accessibility (WCAG AA):**
  - Text color contrast must be at least `4.5:1`.
  - All interactive controls must support visible focus states (`:focus-visible`).
  - Screen reader attributes (`aria-*` and `alt`) must be fully defined on all images and triggers.

---

## 3. Backend Conventions

- **API Design:** All serverless functions in `/api/` must return standard JSON payloads.
- **Inputs Validation:** Standardize input escaping, type-checking, and length limits.
- **Error Handling:** Log errors to server consoles without exposing stack traces in API response payloads.
- **Brute-Force Prevention:** Enforce artificial delays (e.g. `800ms`) on failed authentication API paths.

---

## 4. Performance Budget

- **Lighthouse Scores:** Mobile & Desktop targets must meet:
  - **Performance:** ≥ 95
  - **Accessibility:** 100
  - **Best Practices:** 100
  - **SEO:** 100
- **Core Web Vitals:**
  - **LCP:** < 2.0s
  - **CLS:** < 0.05
  - **INP:** < 200ms
- **Asset Size:** Minimize JavaScript dependencies. Native browser APIs must be used over libraries unless approved.

---

## 5. Security & Protection

- **Environment Secrets:** API secrets (e.g., Supabase keys, Resend credentials) must reside strictly server-side in environment variables and never be exposed in client code.
- **Security Headers:** Enforce headers on Vercel:
  - `X-Robots-Tag: noindex, nofollow` on executive directories.
  - `Cache-Control: no-store, no-cache` on protected pages.
  - `X-Frame-Options: DENY`.
  - `X-Content-Type-Options: nosniff`.
- **Input Sanitization:** Sanitize all fields in contact forms and API calls using HTML escape tools to prevent XSS.

---

## 6. QA & Release Process

- **QA checklist validation:** All check gates in the mobile and desktop QA checklists must be executed.
- **Autofill Audits:** Form testing must verify autocomplete attributes and virtual keyboard configurations.
- **Build Verification:** Compiling of production bundles must build successfully (`npm run build`) with no warnings or type checks.

---

## 7. Deployment & rollback

- **Vercel Infrastructure:**
  - Staging builds are strictly deployed to Vercel production staging (`qtsi-v2.vercel.app`).
  - Do NOT modify DNS or connect `qtsi.ca` until explicit final acceptance.
- **Supabase Persistence:** Standardize leads database migrations using SQL version control files.
- **Rollback Protocol:** In case of build failures, execute Git revert on production branches to instantly redeploy last certified hash.
