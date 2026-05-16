# Development Guidelines: Orange Ember Studios Website

These guidelines establish the core rules, aesthetic standards, and technical practices for developing the Orange Ember Studios website. Adhering to these rules ensures a premium, maintainable, and highly performant product.

## 1. Core technology stack

**Canonical EmberKit docs:** [https://emberkit.orangeember.com](https://emberkit.orangeember.com) — configuration and scripts are defined there (e.g. [Installation](https://emberkit.orangeember.com/docs/installation) uses **`emberkit.config.ts`** and **`@emberkit/cli`**, not a root **`vite.config.ts`**, as the primary app config).

| Layer | Technology |
| --- | --- |
| **Runtime** | Node.js **≥ 22.12** |
| **Framework** | **EmberKit** — `@emberkit/core`, `@emberkit/icons`; **`@emberkit/cli`** for `emberkit dev` / `emberkit build` / `emberkit preview` |
| **Project config** | **`emberkit.config.ts`** at the repo root (`defineConfig` from `@emberkit/core`) |
| **Interactivity** | **Vue 3** for existing Vue components; **TSX** / EmberKit patterns for JSX routes and islands |
| **Language** | **TypeScript** (strict; `jsxImportSource: "@emberkit/core"`, `moduleResolution: "bundler"` per EmberKit docs) |
| **Styling** | **Tailwind CSS v4** via **`@tailwindcss/vite`** — utilities in components; **design tokens** in `src/styles/global.css` (`@import "tailwindcss"` and `@theme { ... }`). There is **no** `tailwind.config.mjs` in this repo; extend branding via `@theme`, not a separate legacy config unless we add one intentionally. |
| **Data** | **LibSQL** (`@libsql/client`) with access abstracted in `src/lib/db.ts` and **`*.service.ts`** modules |
| **Hosting** | **Cloudflare Workers** + static assets — **`wrangler.jsonc`** (`pnpm deploy` / `pnpm preview` as configured) |
| **Auth / crypto** | **jose** (JWT), env-driven secrets on the worker |
| **Content / i18n** | i18n JSON under `src/i18n/`; Markdown/MDX per [EmberKit Markdown/MDX](https://emberkit.orangeember.com/docs/markdown) when used |
| **SEO** | Follow [EmberKit meta/head docs](https://emberkit.orangeember.com/docs/meta) and per-page requirements in this guide |
| **Testing** | **Vitest** + **happy-dom**, colocated `*.test.ts` — see `TDD_Guidelines.md` (test runner config may use `vitest.config.ts` separately from app build config) |

**Package manager:** **pnpm** (use `pnpm add`, not `npm install`, in documentation examples for this project).

**Architecture note:** Prefer **hexagonal-style boundaries** — business rules and data orchestration in `src/lib/` (especially services), HTTP/API adapters in `src/server/` (and the worker entrypoint as configured), and keep I/O (DB, env) behind thin adapters so logic stays testable.

**DRY:** Share validation, parsing, and mapping through `src/lib/` (or small modules) instead of duplicating across routes or components.

## 2. Design & aesthetic standards (CRITICAL)

Orange Ember Studios is a premier development studio specializing in **desktop and mobile video games**, as well as **web and mobile applications**. The website MUST reflect a premium, state-of-the-art aesthetic that appeals to clients looking for high-end digital products and immersive experiences.

- **Visual impact:** Avoid generic layouts and colors. This project uses **OKLCH-based** brand scales in `src/styles/global.css` (e.g. ember / void palettes); keep new colors consistent with that system or extend `@theme` deliberately.
- **Dynamic & alive:** Interfaces must respond to user interactions. Make heavy use of **hover effects, micro-animations, and smooth transitions** on buttons, cards, and links.
- **Typography:** Use modern, high-quality typography (e.g., Inter, Outfit, or standard Google Fonts). Do NOT use default browser fonts.
- **Placeholders:** Do not use generic placeholders. Use AI tools (like image generation) to create realistic demo assets if real assets are not yet available.

## 3. Styling & Tailwind CSS (v4) rules

- **Architecture:** Use Tailwind utility classes in Vue/TSX components. Custom animations or keyframes can live in scoped styles or in `global.css` alongside `@theme`.
- **Responsive design:** Mobile-first (`md:`, `lg:`, etc.); layouts must adapt fluidly across screen sizes.
- **Tokens:** **Brand colors, fonts, and radii belong in `src/styles/global.css` inside `@theme { ... }`** so the whole app stays consistent.

### Tailwind v4 + EmberKit (this repo)

EmberKit is Vite-powered; Tailwind v4 is registered as a **Vite plugin** (`tailwindcss()` from `@tailwindcss/vite`). Wire plugins through **`emberkit.config.ts`** as EmberKit documents for your version—do **not** add a separate root **`vite.config.ts`** as the primary app configuration ([Installation](https://emberkit.orangeember.com/docs/installation)).

1. **Dependencies:** `tailwindcss` and `@tailwindcss/vite`.
2. **Global CSS:** `src/styles/global.css` starts with `@import "tailwindcss";` and defines `@theme { ... }`.
3. **Entry:** Import the stylesheet from the EmberKit entry/layout (e.g. `src/index.tsx` or `src/routes/_layout.tsx`).

## 4. Component architecture

- **Modularity:** Build small, reusable components (e.g. `<Button />`, `<ProjectCard />`).
- **Structure:** Every component MUST have its own dedicated folder, grouping the source (`.vue` or `.tsx` as appropriate) with **`Component.test.ts`**. Routes live under `src/routes/` per [EmberKit Routing](https://emberkit.orangeember.com/docs/routing).
- **Naming conventions:**
  - Astro/Vue/TSX files: `PascalCase` with matching extension.
  - Directories: **`PascalCase`** for feature components (e.g. `Hero/`, `Contact/`) to match the repo; use **`kebab-case`** for generic UI buckets if added (e.g. `ui-elements/`).
  - CSS classes: Tailwind utilities; custom scoped CSS in `kebab-case` if needed.

## 5. SEO & accessibility (a11y) best practices

- **Semantic HTML:** Use proper HTML5 elements (`<header>`, `<main>`, `<article>`, `<section>`, `<footer>`).
- **Headings:** Strict hierarchy; only ONE `<h1>` per page.
- **Meta tags:** Every page MUST have dynamic, accurate `<title>` and `<meta name="description">`.
- **Unique IDs:** Interactive elements should have stable IDs where needed for testing and accessibility.
- **Alt text:** All images need descriptive `alt` attributes.

## 6. Security practices (Cloudflare & frontend)

- **Security headers (`public/_headers`):** CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, and related hardening as deployed on Cloudflare.
- **Form anti-spam:** Use honeypot (and/or Turnstile where configured) on public forms; drop submissions when bots trip hidden fields.
- **Secrets:** Never commit credentials; use **Wrangler** / Cloudflare dashboard and local `.dev.vars` for development as documented for Workers.

## 7. Development workflow

1. Pick up work from the team backlog, issues, or internal planning docs under `docs/` when available.
2. Follow the **strict red → green → refactor** cycle in `TDD_Guidelines.md`.
3. Run **`pnpm test`** before considering logic changes done.
4. For production parity locally: **`pnpm build`** then **`pnpm preview`** (per `package.json`; often `emberkit preview` and/or Wrangler with built assets).
5. Review against the aesthetic standards before marking work complete.

For agent-oriented stack summary (Emberkit, Cloudflare, TDD, hexagonal layout), see **`AGENTS.md`** at the repository root.
