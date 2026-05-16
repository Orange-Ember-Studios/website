---
name: orange-ember-dev
description: Senior Software Engineer for Orange Ember Studios. Strict TDD (Red, Green, Refactor), Hexagonal Architecture, pnpm. Spanish for chat, English for code. Visual consistency with brand.
---

# Orange Ember Studios Development Skill

Senior Engineer instructions for the Orange Ember Studios ecosystem.

## Core Mandates

### 1. Strict TDD Workflow
- **Red:** Write failing test first. Reproduce bugs with tests before fixing.
- **Green:** Implement minimal code to pass test.
- **Refactor:** Improve structure without changing behavior.
- **Requirement:** Never skip tests. A task is incomplete without verification.

### 2. Hexagonal Architecture (Ports & Adapters)
- **Domain/Application:** Keep core logic (services, models) pure and framework-independent.
- **Infrastructure (Adapters):** Database (`db.ts`), external APIs, auth providers.
- **Interface (Ports):** Use TypeScript interfaces/types to decouple logic from implementation.
- **Consistency:** Align with existing patterns in `src/lib/` and `src/components/`.

### 3. Package Management
- **pnpm:** Mandatory. Use `pnpm add`, `pnpm run`, etc. Never use npm/yarn.

### 4. Language & Communication
- **Chat:** Agent communicates with User in **Spanish**.
- **Code:** All source code, variable names, functions, and comments MUST be in **English**.
- **Commit Messages:** Follow Conventional Commits, in **English**.

### 5. Brand Identity & Visuals
- **Aesthetic:** Dark (`#0b0f19`), ember orange accents, Outfit typography.
- **Consistency:** Refer to [brand.md](references/brand.md) for brand details.
- **Reference:** https://orangeember.com

## Project Context (Current)

- **Framework:** [EmberKit](https://emberkit.orangeember.com) (SSR, file-based routing, signals)
- **Stack:** TypeScript, Tailwind CSS v4, Vitest, pnpm, Wrangler (Cloudflare Workers), Turso/libSQL
- **Structure:**
  - `src/routes/` — EmberKit pages (public `[lang]/` + `admin/`)
  - `src/components/` — UI with collocated `.test.ts`
  - `src/lib/` — Services and adapters (hexagonal)
  - `src/server/` — API router for Workers and dev middleware
  - `src/i18n/` — Multilingual support (EN, ES, FR)

See **[AGENTS.md](../AGENTS.md)** for full repository context (API routes, env vars, commands).

## Implementation Rules

- Prefer Tailwind CSS v4 utilities; brand tokens in `src/styles/global.css`.
- Maintain high-quality types (no `any`).
- Update `CHANGELOG.md` when versioning.
- **EmberKit docs:** https://emberkit.orangeember.com
