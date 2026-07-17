# QTSI Mobile Production Acceptance Checklist

This document contains the final **Production Acceptance Gates** that must be fully checked and signed off before launching the V2 site to production. The launch is blocked until every single gate below has a validated pass.

---

## 1. Technical & Performance Audits
- [ ] **Lighthouse Performance Target:** Verified mobile score of **≥ 95** on index pages.
- [ ] **Core Web Vitals:** Cumulative Layout Shift (CLS) is verified **< 0.05** on all pages.
- [ ] **Accessibility (WCAG AA):** Mobile accessibility score is verified at **100** via automated validators.
- [ ] **Best Practices & SEO:** Lighthouse audits confirm **100** for best practices and SEO mobile compliance.

---

## 2. Functional Integrations
- [ ] **Supabase CRM Sync:** Test form submissions from mobile. Verify database inserts occur immediately with correct metadata.
- [ ] **Email Delivery Routing:** Confirm lead notifications route successfully to **`info@qtsi.ca`** within 30 seconds of mobile submissions.
- [ ] **Calendly Integration:** Verify Calendly booking modal opens smoothly on mobile screens without viewport clipping or blocking gestures.
- [ ] **Analytics (GA4) Tracking:** Test page views and form button actions on mobile device simulations. Verify tags trigger correctly in GA4 debugger.

---

## 3. UI, Layout & Safe-Areas
- [ ] **Safe-Area Padding:** Confirm navigation headers, floating buttons, and mobile menu overlays completely respect notch space and gesture line bars (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).
- [ ] **Hero Render Quality:** Page heroes stack correctly without visual distortion, excessive empty whitespace, or overlapping text.
- [ ] **Image Parameters:** Verify all images render with explicit dimensions (preventing CLS) and next-gen formats (WebP/AVIF) are loaded correctly.
- [ ] **No Horizontal Overflow:** Absolute zero horizontal viewport scroll on narrow devices (down to 320px).

---

## 4. Mobile Usability & Interactivity
- [ ] **Cross-Browser Verification:** Tested and passed on Safari iOS, Chrome Android, Samsung Internet, Firefox Mobile, and Edge Mobile.
- [ ] **One-Handed Thumb Reach:** All primary CTAs, forms, and closing buttons are verified reachable and usable with one hand.
- [ ] **Scroll Lock Overlay:** Verify body viewport scroll is locked on overlays. No scrolling underneath when contact modal or menu is open.
- [ ] **Touch Target Safety:** Zero misclicks or double-taps on close items or footer links.

---

## Sign-Off Validation

| Sign-Off Gate | Verified By (Name/Agent) | Timestamp | Status |
| :--- | :--- | :--- | :---: |
| **Mobile Performance & CLS** | | | [ ] Pending |
| **Supabase & Email Delivery** | | | [ ] Pending |
| **Notch & Safe Areas** | | | [ ] Pending |
| **Cross-Browser Acceptance** | | | [ ] Pending |
