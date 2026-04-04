---
name: orange-ember-standards
description: Core development guidelines and TDD practices for Orange Ember Studios.
---

# Orange Ember Studios Development Standards

This skill ensures that all development work adheres to the premium quality, aesthetic standards, and technical rigor defined by Orange Ember Studios.

## 1. Core Principles & Technology Stack
- **Framework:** Astro (Static-site generation, zero-JS by default).
- **Styling:** **Tailwind CSS** (Utility-first, responsive, and consistent).
- **Logic:** TypeScript / Vanilla JavaScript. Use **Vue.js** for complex client-side interactivity.
- **Testing:** Mandatory **Test-Driven Development (TDD)** using **Vitest** for unit/components and **Playwright** for E2E.

## 2. Design & Aesthetics (Premium Quality)
Orange Ember Studios specializes in high-end digital products. All UI work MUST meet these standards:
- **Visual Excellence:** Use harmonious color palettes (custom HSL), elegant dark modes, and modern typography (Inter, Outfit, etc.).
- **Interactive UI:** Implement hover effects, micro-animations, and smooth transitions.
- **No Placeholders:** Use `generate_image` or high-quality assets. Avoid generic placeholders.

## 3. TDD Workflow (Red-Green-Refactor)
You MUST follow this cycle for every feature:
1.  **🔴 RED:** Write a failing test in the same directory as the source file (e.g., `Component.test.ts`).
2.  **🟢 GREEN:** Write the *minimum* code required to pass the test.
3.  **🔵 REFACTOR:** Clean up the code while keeping tests green.

**Crucial:** No production code should be written without a corresponding failing test first.

## 4. Architecture & Structure
- **Component Modularity:** Build small, reusable components.
- **Folder Pattern:** Every component lives in its own folder with its test.
    - `src/components/MyComponent/MyComponent.astro`
    - `src/components/MyComponent/MyComponent.test.ts`
- **SEO & A11y:** Use semantic HTML5, strict heading hierarchy (one `<h1>`), and mandatory descriptive meta tags/alt text.

## 5. Security & Deployment
- **Security Headers:** Implement CSP, HSTS, and other security headers.
- **Anti-Spam:** Use "Honeypot" fields for Vue-based forms.

## 6. How to invoke this Skill
When the user asks to "start a new feature" or "fix a bug", always mention that you are applying the `orange-ember-standards` and begin with the Red (failing test) phase of TDD.
