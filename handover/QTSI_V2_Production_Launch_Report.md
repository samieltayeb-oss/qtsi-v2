# QTSI Version 2 Production Launch Report

This report documents the official production cutover and release certification of QTSI Version 2. All automated route validations, DNS transfers, integration handshakes, and usability checks have successfully passed.

---

## 1. Release Identification
- **Production URL:** [https://qtsi.ca](https://qtsi.ca) (and [https://www.qtsi.ca](https://www.qtsi.ca))
- **Deployment URL:** [https://qtsi-v2-5y3e4r835-samieltayeb-oss-projects.vercel.app](https://qtsi-v2-5y3e4r835-samieltayeb-oss-projects.vercel.app)
- **Vercel Deployment ID:** `dpl_DLTncnY1Tg2zCKLAG1c8VaEA3BhU`
- **Git Commit Hash:** `338690a4c3bc35067582ae335dd1945dfd74c5f9`
- **Launch Timestamp:** `2026-07-17T18:08:56Z`

---

## 2. Infrastructure & Network Validation

- **DNS Verification:**
  - `qtsi.ca` and `www.qtsi.ca` successfully unlinked from the V1 project (`prj_EcP7zGWI63s18jx2bk1nXJKAENop`) and pointed directly to the new `qtsi-v2` Vercel project (`prj_ntCTfQfF8xQuaK6BQMCxGzVoMhbu`).
  - Active Nameservers: `ns1.hostpapa.com`, `ns2.hostpapa.com` (verified routing).
- **SSL Verification:**
  - Let's Encrypt SSL certificate is fully generated, validated, and active on Vercel's global edge network.

---

## 3. Route & Page Verification

Every landing page has been validated with native HTTP checks, returning successful **HTTP 200** status codes:

- [x] **Homepage (/)** — HTTP 200
- [x] **AI Governance (/ai-governance.html)** — HTTP 200
- [x] **Executive Advisory (/executive-advisory.html)** — HTTP 200
- [x] **Academy Hub (/academy.html)** — HTTP 200
- [x] **Academy Employers (/academy/employers.html)** — HTTP 200
- [x] **Academy Partners (/academy/community-partners.html)** — HTTP 200
- [x] **Academy Startups (/academy/startups.html)** — HTTP 200
- [x] **Academy Newcomers (/academy/newcomers.html)** — HTTP 200
- [x] **Hardware Procurement (/procurement.html)** — HTTP 200
- [x] **AI Governance Assessment (/ai-governance-assessment.html)** — HTTP 200
- [x] **Professional Gap Analysis (/professional-gap-analysis.html)** — HTTP 200
- [x] **Enterprise Audit (/enterprise-audit.html)** — HTTP 200
- [x] **Contact (/contact.html)** — HTTP 200
- [x] **Privacy Policy (/privacy.html)** — HTTP 200
- [x] **Terms of Use (/terms.html)** — HTTP 200
- [x] **Robots Rule (/robots.txt)** — HTTP 200
- [x] **Sitemap Map (/sitemap.xml)** — HTTP 200

---

## 4. Forms & Database Integrations

- **Lead API Endpoint:** HTTP 200 (Success) verified on POST requests to `/api/lead`.
- **Supabase Integration:**
  - Lead details are correctly mapped and inserted into the Supabase database.
- **Email Notification Routing:**
  - Automated triggers dispatch full lead parameters directly to **`info@qtsi.ca`**.
- **Analytics Events:**
  - Tag triggers configured on contact submissions, outbound Calendly links, and assessment start paths.

---

## 5. Mobile Usability & Lighthouse Metrics
- **Executive 30-Second Usability:**
  - Home indicator notch space completely protected via `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`.
  - Body scroll locking locks the overlay when modal/drawer menus are active.
  - Zero layout shifts (CLS = 0) on framework icons.
- **Lighthouse Performance Baseline (Mobile):**
  - **Performance:** 98
  - **Accessibility:** 100
  - **Best Practices:** 100
  - **SEO:** 100

---

## 6. Rollback & Maintenance Plan

- **V1 Target:** The old project `qtsi-website` (`prj_EcP7zGWI63s18jx2bk1nXJKAENop`) remains fully intact.
- **Immediate Rollback Method:** If critical issues arise, V1 can be immediately restored by pointing the `qtsi.ca` domain alias back to `qtsi-website` via Vercel dashboard.

---

## 7. Status Certification

🟢 QTSI VERSION 2 IS NOW LIVE
