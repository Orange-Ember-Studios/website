# TDD Guidelines for Orange Ember Studios

Test-Driven Development keeps the EmberKit codebase reliable, refactor-safe, and documented through tests.

## 1. The Red-Green-Refactor cycle

### RED — Write a failing test

- Define the smallest unit of behavior.
- Run `pnpm test` and confirm the test **fails** for the right reason.

### GREEN — Make it pass

- Write the **minimum** production code to satisfy the test.
- Do not optimize architecture yet.

### REFACTOR — Clean up

- Improve names, remove duplication, tighten types.
- Re-run `pnpm test` after every change; behavior must stay green.

---

## 2. AI collaboration workflow

### Starting a feature

- **Prompt:** *"Implement [Feature]. Start with a failing test for [behavior]."*
- **Action:** Add `*.test.ts` / `*.test.tsx` next to the source; run Vitest to show red.

### Implementing logic

- **Prompt:** *"Test fails as expected. Minimal code to pass."*
- **Action:** Implement in `src/lib/` or `src/components/` as appropriate.

### Refactoring

- **Prompt:** *"Tests pass. Refactor [file] for clarity without changing behavior."*
- **Action:** Refactor; keep the suite green.

---

## 3. General principles

1. **Small increments** — One behavior per cycle.
2. **Test location** — Collocated with source: `foo.ts` + `foo.test.ts` under the same directory.
3. **Meaningful names** — e.g. `it('returns 404 when post slug is missing')`, not `it('works')`.
4. **No production code without a failing test** — Except trivial wiring explicitly agreed with the team.

---

## 4. Tooling (this project)

| Tool | Role |
| --- | --- |
| **Vitest** | Unit and component tests (`pnpm test`) |
| **happy-dom** | DOM environment (`vitest.config.ts`) |
| **@testing-library/dom** | DOM queries and assertions |
| **vitest.setup.ts** | Global test setup |

Configuration merges `emberkit.config.ts` Vite settings with Vitest in `vitest.config.ts`:

```typescript
// vitest.config.ts
test: {
  environment: "happy-dom",
  setupFiles: ["./vitest.setup.ts"],
  include: ["src/**/*.test.{ts,tsx}"],
  globals: true,
}
```

### Running tests

```bash
pnpm test              # single run (CI)
pnpm exec vitest       # watch mode during development
```

### API and server tests

- Import `handleApiRequest` from `src/server/api-router.ts`.
- Pass a mock `SiteEnv` (see `src/server/blog-api.test.ts`, `portfolio-api.test.ts`).
- Cloudflare Workers types are stubbed in `src/test/cloudflare-workers-stub.ts` for Node/Vitest.

### What we do not use yet

- **Playwright / E2E** — Optional future addition for full browser flows; not required for every change today.

---

## 5. EmberKit-specific notes

- Test **pure functions** in `src/lib/` directly.
- For UI, test behavior via DOM (Testing Library) rather than implementation details.
- Route components can be tested in isolation where logic exists; prefer testing extracted helpers when routes are thin.

**Framework docs:** https://emberkit.orangeember.com
