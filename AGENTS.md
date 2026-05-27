# AGENTS.md — Orange Ember Studios Website

Context for AI agents working in this repository. Read this before making changes.

## Project overview

Marketing site and CMS for **Orange Ember Studios** — a premium game and app development studio. Public pages (home, services, portfolio, blog, contact, privacy) plus an authenticated **admin** area for blog posts, portfolio projects, and case studies.

- **Production URL:** https://orangeember.com
- **Repo:** Orange Ember Studios monorepo (`website` package)
- **Package manager:** **pnpm only** (never npm/yarn)

## Technology stack

| Layer | Technology |
| --- | --- |
| Framework | [EmberKit](https://emberkit.orangeember.com) (`@emberkit/core` ^0.4) — TypeScript-first JSX, signals, file-based routing |
| Build / dev | `@emberkit/cli` (`emberkit dev`, `emberkit build`), Vite 6 |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`; design tokens in `src/styles/global.css` (`@theme`) |
| Runtime / deploy | Cloudflare Workers + static assets (`wrangler.jsonc`, `worker.ts` entry) |
| Database | Turso / libSQL via `@libsql/client` |
| Auth | JWT (`jose`) — admin sessions via HTTP-only cookies |
| Rich text (admin) | Editor.js |
| Markdown (public) | `marked` + Shiki |
| Icons | `@emberkit/icons` |
| Testing | Vitest 4 + happy-dom + Testing Library |
| Node | `>=22.12.0` |

**EmberKit documentation:** https://emberkit.orangeember.com

> The site migrated from Astro to EmberKit in v0.0.20. Do not add Astro/Vue patterns; use EmberKit JSX (`.tsx`) and `@emberkit/core` APIs (`createSignal`, `createEffect`, `render`, route components).

## Repository layout

```text
/
├── index.html              # SPA shell, CSP, fonts, Turnstile script
├── emberkit.config.ts      # EmberKit + Vite (SSR mode, dev API middleware)
├── vite.config.ts          # CI shim + Vitest merge
├── wrangler.jsonc          # Cloudflare Workers deploy config
├── worker.ts               # Worker entry (API + asset serving)
├── public/                 # Static assets, _headers, robots.txt
├── docs/                   # Human + agent guidelines
│   ├── development_guidelines.md
│   └── TDD_Guidelines.md
├── src/
│   ├── index.tsx           # Client bootstrap, preload, render
│   ├── routes/             # File-based routes (EmberKit)
│   ├── components/         # UI by feature (Hero, Blog, Admin, …)
│   ├── lib/                # Domain services & adapters (hexagonal)
│   ├── server/             # API router (Workers + Node dev shim)
│   ├── i18n/               # en, es, fr translations
│   ├── styles/global.css   # Tailwind + brand tokens
│   └── constants/urls.ts   # External and API URL constants
├── migrations/             # SQL schema, legacy patches, init seeds
└── scripts/                # One-off data scripts, versioning utilities
```

## Routing

Routes live under `src/routes/` using EmberKit file-based routing (`virtual:emberkit-routes`).

| Path | Purpose |
| --- | --- |
| `/` | Language redirect → `/{lang}/` |
| `/{lang}/` | Home (en, es, fr) |
| `/{lang}/blog`, `/{lang}/blog/[slug]` | Public blog |
| `/{lang}/privacy` | Privacy policy |
| `/admin`, `/admin/login` | Admin dashboard / login |
| `/admin/blog`, `/admin/project`, `/admin/case_study` | CMS list + `[id]` editors |
| `/admin/profile` | Admin profile / password |

Root layout: `src/routes/_layout.tsx` (Navbar/Footer hidden on admin shell except login).

## API surface

Implemented in `src/server/api-router.ts`. Dev server proxies `/api/*` via `emberkit.config.ts` → `api-router.node.ts`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | — | Admin login |
| POST | `/api/auth/logout` | — | Logout |
| GET | `/api/auth/me` | Admin | Current user |
| POST | `/api/auth/change-password` | Admin | Change password |
| POST | `/api/contact` | Turnstile | Contact form → Resend |
| GET | `/api/portfolio/projects?lang=` | — | Published projects |
| GET | `/api/blog/list?lang=&sort=` | — | Published blog posts |
| GET | `/api/blog/:lang/:slug` | — | Single post |
| GET/POST | `/api/posts/:lang/:slug/likes` | Cookie | Post likes |
| GET/POST/PUT/DELETE | `/api/admin/posts` | Admin | CMS CRUD |

## Architecture conventions

### Hexagonal (ports & adapters)

- **`src/lib/`** — Framework-agnostic services (`posts.service.ts`, `auth.service.ts`, `db.ts`, …).
- **`src/server/`** — HTTP adapters calling lib services.
- **`src/components/`** — UI; keep business logic out of components when a service exists.

### Components

- One folder per component: `Component.tsx` + collocated `Component.test.ts` (or shared `*.test.ts` in folder).
- File names: **PascalCase** for components; directories often PascalCase for features (`Hero/`, `Admin/`).
- Prefer Tailwind utilities; complex animations in `global.css` or scoped styles.

### i18n

- Languages: **en**, **es**, **fr** (`src/i18n/translations/*.json`).
- URL prefix is primary (`/es/blog`); fallback: `localStorage`, `x-language` cookie, `Accept-Language`.
- Use `src/i18n/i18n.ts` helpers; do not hardcode copy in components.

## Environment variables

Use `.env.local` for local development (gitignored). Cloudflare: `.dev.vars` / dashboard secrets.

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL` | libSQL URL (`file:./local.db` or Turso remote) |
| `TURSO_AUTH_TOKEN` | Turso auth (omit for `file:` URLs) |
| `JWT_SECRET` | Admin JWT signing |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile (client) |
| `TURNSTILE_SECRET_KEY` | Turnstile verify (server) |
| `RESEND_API_KEY` | Contact email via Resend |

Migrations live in `migrations/` (SQL under `migrations/sql/`, init seeds under `migrations/init/`). They run automatically when the dev server starts and on each API request via `ensureDatabaseSchema` (`src/lib/db-migrations.ts`).

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # EmberKit dev server (localhost:4321)
pnpm build            # Production build → dist/
pnpm preview          # Build + wrangler dev
pnpm test             # Vitest (run once)
pnpm deploy           # Build + wrangler deploy
pnpm generate-types   # Wrangler types
```

## Testing (mandatory)

Follow **Red → Green → Refactor** (see `docs/TDD_Guidelines.md`).

- Tests: `src/**/*.test.{ts,tsx}` next to source.
- Runner: Vitest (`vitest.config.ts` merges `emberkit.config.ts` vite block).
- Environment: `happy-dom`; setup: `vitest.setup.ts`.
- **Never** ship feature logic without a failing test first (bugs: reproduce with a test, then fix).

## Brand & UX standards

Orange Ember Studios targets a **premium, dark, high-end** aesthetic (games + apps).

- **Tagline:** Create. Ignite. Play.
- **Palette:** Dark backgrounds (`#0b0f19`, ash/void tokens), **ember orange** accents, Outfit typography.
- **Motion:** Hover states, micro-animations, view transitions (`render(..., { viewTransitions: true })` from `@emberkit/core`).
- **Reference:** https://orangeember.com and `orange-ember-dev/references/brand.md`

Avoid generic layouts, default system fonts, and placeholder-looking assets.

## Security

- CSP in `index.html`; additional headers in `public/_headers`.
- Admin routes gated client-side and **all** `/api/admin/*` require valid JWT cookie.
- Contact form: Cloudflare Turnstile + honeypot patterns where applicable.
- Do not commit secrets (`.env`, `.env.local`, `.dev.vars`).

## Deployment

- **Target:** Cloudflare Workers (`wrangler deploy`).
- **Assets:** `dist/` bound as `ASSETS`.
- **Worker:** `worker.ts` serves static assets and delegates `/api/*` to `handleApiRequest`.

## Communication rules (studio skill)

When using the `orange-ember-dev` skill:

- **Chat with user:** Spanish (if that skill is active).
- **Code, comments, commits:** English.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/); update `CHANGELOG.md` when versioning.

## Related documentation

| Document | Contents |
| --- | --- |
| [development_guidelines.md](docs/development_guidelines.md) | Stack, styling, components, SEO, security |
| [TDD_Guidelines.md](docs/TDD_Guidelines.md) | TDD workflow and Vitest practices |
| [README.md](README.md) | Quick start for contributors |
| [CHANGELOG.md](CHANGELOG.md) | Release history |

## What not to do

- Reintroduce Astro, `.astro` files, or Vue SFCs for new UI.
- Use npm/yarn instead of pnpm.
- Add `any` without strong justification.
- Skip tests for new behavior.
- Edit unrelated files or drive-by refactors outside the task scope.
