# Orange Ember Studios — Website

Marketing site and admin CMS for [Orange Ember Studios](https://orangeember.com), built with [EmberKit](https://emberkit.orangeember.com) and deployed on Cloudflare Workers.

## Stack

- **Framework:** [EmberKit](https://emberkit.orangeember.com) — TypeScript JSX, signals, file-based routing
- **Styling:** Tailwind CSS v4
- **Database:** Turso / libSQL
- **Hosting:** Cloudflare Workers + Wrangler
- **Testing:** Vitest

## Prerequisites

- Node.js `>=22.12.0`
- [pnpm](https://pnpm.io/)

## Setup

```bash
pnpm install
cp .env.example .env.local   # if present; otherwise create .env.local
```

Configure `.env.local` (see [AGENTS.md](AGENTS.md#environment-variables) for the full list):

- `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`
- `JWT_SECRET`
- `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`

## Commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server at http://localhost:4321 |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Build + local Wrangler preview |
| `pnpm test` | Run Vitest suite |
| `pnpm deploy` | Build and deploy to Cloudflare |

## Project structure

```text
src/
├── routes/       # Pages (public + admin)
├── components/   # UI components
├── lib/          # Services and data access
├── server/       # API handlers
├── i18n/         # en, es, fr
└── styles/       # Global CSS + Tailwind theme
```

## Documentation

- **[AGENTS.md](AGENTS.md)** — Full project context for AI agents and contributors
- **[docs/development_guidelines.md](docs/development_guidelines.md)** — Design, styling, and architecture standards
- **[docs/TDD_Guidelines.md](docs/TDD_Guidelines.md)** — Test-driven development workflow

**EmberKit docs:** https://emberkit.orangeember.com

## License

Proprietary — Orange Ember Studios.
