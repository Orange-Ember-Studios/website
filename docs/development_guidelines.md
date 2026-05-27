# Development Guidelines: Orange Ember Studios Website

These guidelines establish the core rules, aesthetic standards, and technical practices for developing the Orange Ember Studios website. Adhering to them keeps the product premium, maintainable, and fast.

## 1. Core technology stack

| Area | Choice |
| --- | --- |
| **Framework** | [EmberKit](https://emberkit.orangeember.com) — TypeScript-first JSX, signals, SSR mode, file-based routing |
| **Build** | `@emberkit/cli` (`emberkit dev` / `emberkit build`), Vite 6 |
| **Styling** | **Tailwind CSS v4** via `@tailwindcss/vite` |
| **UI** | EmberKit components (`.tsx`), `@emberkit/icons` |
| **API** | Cloudflare Workers (`src/server/api-router.ts`) |
| **Database** | Turso / libSQL (`@libsql/client`) |
| **Deploy** | Wrangler → Cloudflare Workers + `dist/` assets |
| **Testing** | Vitest + happy-dom (see `TDD_Guidelines.md`) |

**Official EmberKit documentation:** https://emberkit.orangeember.com

> This project migrated from Astro in v0.0.20. Do not add Astro or Vue SFCs for new features.

## 2. Design and aesthetic standards (critical)

Orange Ember Studios is a premier studio for **desktop and mobile games** and **web and mobile applications**. The site must feel premium and state-of-the-art.

- **Visual impact:** Custom palettes (OKLCH ember/void tokens in `src/styles/global.css`), dark mode, subtle gradients — not generic templates.
- **Dynamic and alive:** Hover effects, micro-animations, view transitions via `render(..., { viewTransitions: true })`.
- **Typography:** **Outfit** (Google Fonts) — no default system UI fonts for marketing UI.
- **Assets:** Avoid obvious placeholders; use on-brand imagery from the CDN or realistic demo assets.

See `orange-ember-dev/references/brand.md` and https://orangeember.com for brand reference.

## 3. Styling and Tailwind CSS

- **Setup:** Tailwind v4 Vite plugin in `emberkit.config.ts` and `vite.config.ts`.
- **Global styles:** `src/styles/global.css` — `@import "tailwindcss"` and `@theme { ... }` for brand colors.
- **Usage:** Prefer utility classes in `.tsx` components. Shared animations and complex keyframes belong in `global.css`.
- **Responsive:** Mobile-first (`sm:`, `md:`, `lg:`). Layouts must work on all breakpoints.
- **Do not** rely on a legacy `tailwind.config.mjs`; theme tokens live in `@theme` inside `global.css`.

### Tailwind + Vite (this project)

```typescript
// emberkit.config.ts / vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [emberkitVitePlugin(), tailwindcss()],
  },
});
```

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-ember-500: oklch(0.65 0.26 45);
  /* … */
}
```

Imported from `src/index.tsx`.

## 4. Component architecture

- **Modularity:** Small, reusable components (`Button`, cards, sections).
- **Structure:** Each component in its own folder with collocated tests.

  ```text
  src/components/Hero/
    Hero.tsx
    Hero.test.ts   # optional; may live alongside related modules
  ```

- **Naming:**
  - Components/files: `PascalCase.tsx`
  - Feature folders: `PascalCase` or domain name (`Admin/`, `blog/`)
  - Custom CSS (rare): `kebab-case`

- **Logic:** Keep domain rules in `src/lib/` services; components orchestrate UI and calls to `/api/*`.

## 5. Routing (EmberKit)

Routes are defined under `src/routes/`:

- `src/routes/_layout.tsx` — root layout (nav/footer; admin shell exception)
- `src/routes/[lang]/` — localized public pages
- `src/routes/admin/` — CMS (blog, project, case study, profile)

Consult [EmberKit routing docs](https://emberkit.orangeember.com) for conventions (`RouteComponent`, params, layouts).

## 6. SEO and accessibility

- **Semantic HTML:** `<header>`, `<main>`, `<article>`, `<section>`, `<footer>`.
- **Headings:** One `<h1>` per page; logical hierarchy.
- **Meta:** Accurate `<title>` and description per route/language.
- **IDs:** Unique IDs on interactive elements where needed for a11y and tests.
- **Images:** Descriptive `alt` text.

## 7. Security (Cloudflare and frontend)

- **Headers:** `public/_headers` plus CSP in `index.html`.
- **Admin:** JWT in HTTP-only cookies; never expose `JWT_SECRET` to the client.
- **Forms:** Cloudflare Turnstile on contact; validate server-side in `api-router.ts`.
- **Spam:** Honeypot fields on public forms where applicable.

## 8. Development workflow

1. Read [AGENTS.md](../AGENTS.md) for stack, API, and env vars.
2. For features, follow **Red → Green → Refactor** in `TDD_Guidelines.md`.
3. Run `pnpm test` before opening a PR.
4. Review against aesthetic standards before marking work complete.

## 9. Useful commands

```bash
pnpm dev      # http://localhost:4321
pnpm build
pnpm test
pnpm deploy   # Cloudflare Workers
```
