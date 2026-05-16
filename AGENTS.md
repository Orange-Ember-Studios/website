# Agent instructions — Orange Ember Studios website

This file orients coding agents to how this repository is built and how we expect changes to be made.

**EmberKit documentation (canonical):** [https://emberkit.orangeember.com](https://emberkit.orangeember.com) — start with [Installation](https://emberkit.orangeember.com/docs/installation) and [Quick Start](https://emberkit.orangeember.com/docs/quick-start).

## Project overview

Public marketing and product site for **Orange Ember Studios** (games and apps). The app is built with **EmberKit** (TypeScript-first JSX, file-based routes under `src/routes/`, optional **Vue** for specific UI), **Tailwind CSS v4**, and **Cloudflare** for hosting.

- **Site URL (configured):** `https://orangeember.com`
- **Package manager:** `pnpm` (workspace file present; follow existing lockfile)
- **Node:** `>=22.12.0`

## Core stack

| Concern | Choice |
| --- | --- |
| App framework | **EmberKit** — [`@emberkit/core`](https://emberkit.orangeember.com/docs/installation), [`@emberkit/icons`](https://emberkit.orangeember.com/docs/icons) |
| CLI / build | **`@emberkit/cli`** — `emberkit dev`, `emberkit build`, `emberkit preview` (see [Installation](https://emberkit.orangeember.com/docs/installation)); **no root `vite.config.ts`** as the primary project config |
| Project config | **`emberkit.config.ts`** at the repo root — `defineConfig` from `@emberkit/core` (mode, server, build, routing-related options as documented) |
| UI | **Vue 3** where a component is already Vue-based; **TSX** for EmberKit surfaces |
| Styling | **Tailwind CSS v4** via **`@tailwindcss/vite`**; design tokens in `src/styles/global.css` (`@import "tailwindcss"` + `@theme`) |
| TypeScript | **Strict** project TS (`moduleResolution: "bundler"`, `jsxImportSource: "@emberkit/core"` per EmberKit docs) |
| Data / HTTP API | Centralized **`src/server/api-router.ts`** (and Cloudflare / dev wiring as in this repo); domain logic in `src/lib/*.service.ts` |
| Database (LibSQL / Turso) | Access via `src/lib/db.ts` and service modules |
| Cloud | **Cloudflare Workers** + static assets — **`wrangler.jsonc`** |

Follow the structure and scripts EmberKit documents ([Installation](https://emberkit.orangeember.com/docs/installation)); do not treat Create React App or a random Vite-only scaffold as the source of truth.

## TDD — strict

We follow **Test-Driven Development** with the **red → green → refactor** cycle. Detailed workflow and AI collaboration prompts live in [`docs/TDD_Guidelines.md`](docs/TDD_Guidelines.md).

**Non-negotiables for agents:**

1. **No new behavior without a failing test first** (or an explicit test update when behavior is intentionally changed).
2. **Colocate tests** with source: e.g. `Component.test.ts` next to the component; lib tests as `*.test.ts` beside `*.ts`.
3. **Run tests** with `pnpm test` (Vitest — see `vitest.config.ts`).
4. After refactors, **keep the suite green**; do not “fix” tests by weakening assertions unless the requirement changed.

For broader product rules (design, Tailwind usage, SEO, security headers), see [`docs/development_guidelines.md`](docs/development_guidelines.md).

## Hexagonal architecture (ports and adapters)

Think in layers so **domain logic stays independent** of HTTP and Cloudflare specifics:

- **Domain / application (center):** TypeScript in `src/lib/` — especially `*.service.ts` modules. Prefer **injectable boundaries** (e.g. pass `env` or small facades) over importing Workers globals everywhere in domain code.
- **Driving adapters (inbound):** API router (`src/server/api-router.ts`), EmberKit routes/components — translate HTTP/UI into calls to services.
- **Driven adapters (outbound):** Database client (`src/lib/db.ts`), external APIs — isolate I/O here so logic stays testable (see `src/test/cloudflare-workers-stub.ts` for Vitest).

When adding features, **default to extending a service** and thin route handlers rather than stuffing SQL or business rules into route files.

## DRY and TypeScript best practices

- **DRY:** Extract shared logic into `src/lib/` or small utilities; avoid copy-pasted validation, parsing, and mapping across routes or components.
- **Types:** Prefer explicit types for public service functions and API payloads; use `unknown` + narrowing at boundaries.
- **Imports:** Keep clear module boundaries (`lib` vs `server` vs `components`).
- **Error handling:** Fail predictably at adapters; services should model outcomes rather than leaking HTTP details.

## Commands (from repo root)

Targets below match EmberKit’s documented scripts once **`@emberkit/cli`** is wired in `package.json` ([Installation](https://emberkit.orangeember.com/docs/installation)):

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server (`emberkit dev`) |
| `pnpm build` | Production build (`emberkit build`) |
| `pnpm preview` | Local preview (`emberkit preview` and/or Wrangler, per deploy setup) |
| `pnpm deploy` | Deploy (e.g. build + `wrangler deploy`) |
| `pnpm test` | Vitest (run once) |
| `pnpm generate-types` | `wrangler types` (Cloudflare env typings) |

## What to read before larger changes

1. [https://emberkit.orangeember.com](https://emberkit.orangeember.com) — especially **Installation**, **Routing**, **Edge Deployment** if touching Workers.
2. [`docs/TDD_Guidelines.md`](docs/TDD_Guidelines.md) — TDD cycle and test placement.
3. [`docs/development_guidelines.md`](docs/development_guidelines.md) — design, Tailwind, a11y, security.
4. `emberkit.config.ts` — app mode, server/build, and any Vite-related options EmberKit exposes from this single config.
5. `src/server/api-router.ts` — centralized API behavior.

---

When in doubt: **write or update the test first**, keep **services free of framework imports**, respect **strict TypeScript**, and match **EmberKit + Tailwind 4 + Cloudflare** patterns in this repo.
