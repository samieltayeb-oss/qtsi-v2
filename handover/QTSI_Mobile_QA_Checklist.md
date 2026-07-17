# QTSI Mobile QA Checklist

This checklist must be executed before compiling release candidates for the QTSI platform to verify enterprise-grade mobile compatibility.

---

## 1. Cross-Device & Breakpoint Verification

Audit layouts on both Portrait and Landscape orientations across simulated and physical viewports:

- [ ] **320px (e.g., iPhone SE):** Verify absolute zero horizontal overflow or clipping.
- [ ] **375px / 390px (e.g., iPhone 13/15 Pro):** Verify navigation drawer and safe-area margins.
- [ ] **412px / 430px (e.g., Galaxy S24, iPhone Max):** Check card grids wrap smoothly.
- [ ] **768px (e.g., iPad Mini):** Verify transition from mobile nav to desktop nav.
- [ ] **1024px (e.g., iPad Pro):** Check column wrapping on large screens.

---

## 2. Touch Target & Navigation Audits

- [ ] **Touch Target Size:** Ensure all interactive elements have a bounding box of at least **44px × 44px**.
- [ ] **One-Handed Accessibility:** Check that primary buttons and modal close triggers are easily reachable with the thumb.
- [ ] **Notch & Safe Areas:** Verify that headers, drawers, and footers respect safe area padding (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).
- [ ] **Scroll Lock:** Confirm that body scrolling is locked completely when either the mobile navigation drawer or the lead modal is open.

---

## 3. Typography & Reading Rhythm

- [ ] **Headline Wrapping:** Ensure headings do not wrap into single-character lines.
- [ ] **Text Size:** Body copy must not shrink below `16px` (1rem) on phone screens.
- [ ] **Reading Line Length:** Verify that paragraphs do not span more than `60ch` maximum length to prevent visual fatigue.

---

## 4. Mobile Forms UX Compliance

- [ ] **Input Fields Autofill:** Test name, email, and company fields to verify browser autofill triggers correctly.
- [ ] **Auto-Zoom Prevention:** Confirm input fonts are at least `16px` to prevent iOS Safari auto-zoom.
- [ ] **Mobile Keyboards:** Verify email inputs trigger the `@` keyboard layout and phone inputs trigger the numerical layout.
- [ ] **Success/Error States:** Test form submissions on mobile viewports to ensure success cards and error alerts render inside the scroll viewport.

---

## 5. Mobile Performance Budget

Execute Lighthouse mobile tests to ensure the following thresholds are maintained:

- [ ] **Lighthouse Mobile Score:** ≥ 95
- [ ] **Performance Score:** ≥ 95
- [ ] **Accessibility Score:** 100
- [ ] **Best Practices Score:** 100
- [ ] **SEO Score:** 100
- [ ] **Content Layout Shift (CLS):** < 0.05
- [ ] **Interaction to Next Paint (INP):** < 200ms

---

## 6. Above-the-Fold Executive Test

For every page, verify that the initial screen viewport loads clean layouts without scrolling:

- [ ] **Primary Message:** Header/hook is fully readable and clear.
- [ ] **Call-to-Action:** At least one primary button/CTA is completely visible.
- [ ] **Identity:** QTSI Logo is loaded, sharp, and properly aligned.
- [ ] **Navigation:** The mobile navigation menu trigger is fully visible and clickable.
- [ ] **Zero Clipping:** No hero illustrations or typography clip past viewport boundaries.
- [ ] **Whitespace Balance:** No oversized blank spacing or empty gaps above the fold.

---

## 7. Thumb-Zone Usability Audit

Verify natural, comfortable one-handed usability across mobile viewports:

- [ ] **Primary Actions:** Main conversion button is positioned comfortably within thumb reach.
- [ ] **Secondary Actions:** Inline links and minor CTAs do not require stretching.
- [ ] **Menu Accessibility:** The hamburger trigger is positioned for quick thumb tap.
- [ ] **Close & Dismissal:** Modal close buttons and drawer close triggers are easily reachable and clickable.

---

## 8. Accessibility Testing Matrix

Verify standard WCAG compliance on physical test devices:

- [ ] **VoiceOver (iOS):** Test site navigation with screen reader. Verify correct reading flow.
- [ ] **TalkBack (Android):** Test with Android screen reader. Verify elements are described properly.
- [ ] **Keyboard Navigation:** Use tab buttons to navigate the site. Confirm logic flow.
- [ ] **Focus Indication:** Ensure focused inputs/links render a clear visual focus boundary.
- [ ] **Screen-Reader Labels:** Verify that all icons, buttons, and logos have robust text fallbacks (`alt` tags or `aria-label`).

