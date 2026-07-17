# QTSI Mobile Design Guidelines

This document establishes the official mobile design and development standards for the Quality Training & Technology Services Inc. (QTSI) digital platforms. It guarantees a luxury, minimal, and highly accessible user experience for enterprise executives on mobile viewports.

---

## 1. Breakpoints & Grid System

We design responsive layouts using fluid flexbox and grid systems, preventing horizontal overflow down to **320px**.

| Breakpoint Target | Device Class | Grid Columns | Container Padding |
| :--- | :--- | :---: | :---: |
| `< 480px` | Small Mobile (e.g., iPhone SE) | 1 | `1rem` (16px) |
| `480px - 768px` | Large Mobile (e.g., Galaxy S24, iPhone Pro Max) | 1 | `1.5rem` (24px) |
| `768px - 1024px` | Tablets (e.g., iPad Mini, iPad Pro Portrait) | 2 | `2rem` (32px) |
| `> 1024px` | Desktop Reference (Reference standard) | 12 | `var(--sp-6)` |

---

## 2. Typography Scale

Headings must scale down dynamically on smaller viewports to prevent awkward line breaks and overflow.

```css
/* Typography Scale Standards */
@media (max-width: 768px) {
  .display-xl {
    font-size: 2.25rem;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }
  .display-lg {
    font-size: 1.875rem;
    line-height: 1.2;
  }
  .display-md {
    font-size: 1.5rem;
    line-height: 1.25;
  }
  .text-body-lg {
    font-size: 1rem;
    line-height: 1.6;
  }
}

@media (max-width: 480px) {
  .display-xl {
    font-size: 1.875rem;
    line-height: 1.2;
  }
  .display-lg {
    font-size: 1.5rem;
    line-height: 1.25;
  }
  .display-md {
    font-size: 1.35rem;
    line-height: 1.3;
  }
}
```

---

## 3. Touch Layouts & Spacing Budgets

- **Touch Target Budget (P0):** Every interactive element (buttons, links, form inputs) must have a minimum touch target area of **44px × 44px** (preferably 48px).
- **One-Handed Usability:** Place critical call-to-actions (CTAs) within the thumb zone. Avoid forcing users to stretch their thumbs to the top corners.
- **Whitespace Rules:** Section paddings on mobile are scaled down to prevent massive gaps:
  - Mobile section padding: `var(--sp-12)` (48px) top and bottom.
  - Intermediate container gaps: `var(--sp-6)` or `var(--sp-8)` maximum.

---

## 4. Mobile Navigation Drawer

- **Trigger:** A clean, accessible hamburger menu (`44px` target) with custom animated lines that transition into an "X".
- **Overlay:** Slide-in fullscreen drawer with background blur (`backdrop-filter: blur(20px)`) and a pure white opaque background.
- **Scroll Lock:** When the mobile menu is open, the body must toggle the class `.drawer-open` (which locks the viewport and disables elastic scrolling on iOS Safari).
- **Safe Areas:** Padding must respect safe area boundaries (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`) for notch and home-indicator devices.
- **Speed:** Transitions are limited to **200–250 ms ease-out** to feel snappy and executive-grade.

---

## 5. Mobile Forms & Input Compliance

- **Autocomplete:** Every input field must have an explicit `autocomplete` attribute mapping to browser autofill systems (e.g. `autocomplete="name"`, `autocomplete="email"`, `autocomplete="organization"`).
- **Virtual Keyboards:** Use appropriate input types to map custom keyboards on mobile:
  - Business Email → `type="email"`
  - Phone numbers → `type="tel"`
- **iOS Viewport Locking:** Ensure font sizes on form inputs are **at least 16px** (1rem). iOS Safari will zoom in automatically when focusing inputs with font sizes below 16px, disrupting user layouts.
