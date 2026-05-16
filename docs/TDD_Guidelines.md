# TDD Guidelines for Orange Ember Studios

These guidelines outline the Test-Driven Development (TDD) process to be followed in this project. Using TDD ensures code reliability, easier refactoring, and clear documentation of features through tests.

## 1. The Red-Green-Refactor Cycle

We follow the standard TDD cycle for all feature development and bug fixes:

### RED: Write a failing test

- **Goal:** Define the requirement.
- Write a test for the smallest possible unit of work.
- Run the test suite and confirm it **fails**. This ensures the test is valid and actually testing something that has not been implemented yet.

### GREEN: Make it pass

- **Goal:** Get to green as quickly as possible.
- Write the **minimum amount of code** necessary to satisfy the test.
- Do not worry about perfect architecture or performance at this stage.

### REFACTOR: Clean up

- **Goal:** Improve the code without changing its behavior.
- Remove duplication, improve names, and optimize structure (aligns with **DRY** and clear **TypeScript** types).
- Run tests after every change to ensure they stay green.

---

## 2. AI collaboration workflow

When working with an AI assistant, use these patterns to maintain a TDD flow:

### Starting a feature

- **Prompt:** *"I want to implement [Feature Name]. Let's start with a failing test for [Specific Behavior]."*
- **Expected:** A new or updated test that fails for the right reason before production code is added.

### Implementing logic

- **Prompt:** *"The test is failing as expected. Now, write the minimum code to make it pass."*
- **Expected:** Implementation only sufficient to satisfy the test.

### Refactoring

- **Prompt:** *"The tests are passing. Refactor [File/Function] for readability or structure while keeping the suite green."*
- **Expected:** Structural improvements with no behavior change; all tests still pass.

---

## 3. General principles

1. **Small increments:** One behavior per cycle; each cycle should be short.
2. **Test placement:**
   - **Colocate** unit tests with sources: `src/.../foo.ts` → `src/.../foo.test.ts` (and `*.test.tsx` where applicable).
   - Reserve a top-level `tests/` or `e2e/` folder only if we add integration or Playwright suites later.
3. **Naming:** Use descriptive names, e.g. `it('should calculate the total price including tax')`, not `it('works')`.
4. **No implementation without a test:** Do not add production behavior except to make a failing test pass (or to adjust tests when requirements change intentionally).

---

## 4. Tooling in this repository

The app is built with **EmberKit** ([docs](https://emberkit.orangeember.com)); **Vitest** runs tests using **`vitest.config.ts`** (that file is for the test runner only—not a replacement for **`emberkit.config.ts`**, which is the primary app configuration per [Installation](https://emberkit.orangeember.com/docs/installation)).

| Tool | Role |
| --- | --- |
| **Vitest** | Unit and component tests; **`pnpm test`** runs `vitest --run` |
| **happy-dom** | Default DOM environment for tests |
| **@testing-library/vue** / **@vue/test-utils** | Vue component testing |
| **@testing-library/dom** + **@testing-library/jest-dom** | DOM assertions where used |
| **Stub** | `src/test/cloudflare-workers-stub.ts` aliases `cloudflare:workers` so logic can run outside the Worker |

**Commands:**

- **`pnpm test`** — run the full suite once (CI-style).
- Use **`pnpm exec vitest`** (watch mode) during active TDD if you prefer continuous runs.

**Optional future tooling:** **Playwright** (or similar) for end-to-end tests against the deployed or preview site — not required for the core strict TDD loop but recommended before large releases once a suite exists.

---

## 5. Architecture and testability

- Put **use cases** in **`src/lib/*.service.ts`** (and related modules); **test them** without spinning up Astro or Cloudflare when possible.
- Keep **HTTP glue** (`src/server/api-router.ts`, `src/pages/api/*`) **thin** so tests focus on behavior, not framework wiring.
- Prefer **injecting** env or small ports where it makes tests deterministic; avoid global Worker-only APIs deep inside domain logic.

This matches **hexagonal** boundaries: tests target the **core**; adapters stay replaceable.
