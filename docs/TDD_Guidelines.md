# TDD Guidelines for Orange Ember Studios

These guidelines outline the Test-Driven Development (TDD) process to be followed in this project. Using TDD ensures code reliability, easier refactoring, and clear documentation of features through tests.

## 1. The Red-Green-Refactor Cycle

We follow the standard TDD cycle for all feature development and bug fixes:

### 🔴 RED: Write a Failing Test
- **Goal:** Define the requirement.
- Write a test for the smallest possible unit of work.
- Run the test suite and confirm it **fails**. This ensures the test is valid and actually testing something that hasn't been implemented yet.

### 🟢 GREEN: Make it Pass
- **Goal:** Get to "Green" as quickly as possible.
- Write the **minimum amount of code** necessary to satisfy the test.
- Don't worry about perfect architecture or performance at this stage.

### 🔵 REFACTOR: Clean Up
- **Goal:** Improve the code without changing its behavior.
- Remove duplication, improve variable names, and optimize the structure.
- Run tests after every change to ensure they stay green.

---

## 2. AI Collaboration Workflow

When asking me (the AI) to help with development, use these specific patterns to maintain a TDD flow:

### Starting a Feature
- **Prompt:** *"I want to implement [Feature Name]. Let's start with a failing test for [Specific Behavior]."*
- **My Action:** I will create the test file and write the initial test case. I will run it to show it fails.

### Implementing Logic
- **Prompt:** *"The test is failing as expected. Now, write the minimum code to make it pass."*
- **My Action:** I will implement the feature logic in the target file.

### Refactoring
- **Prompt:** *"The tests are passing. Can you refactor [File/Function] for better readability/performance while keeping it green?"*
- **My Action:** I will suggest improvements and verify them with the existing tests.

---

## 3. General Principles

1.  **Small Increments:** Tackle one small behavior at a time. A TDD cycle should ideally take only a few minutes.
2.  **Test Location:**
    - Place unit tests in the same directory as the source file (e.g., `src/utils/math.ts` and `src/utils/math.test.ts`).
    - Keep integration or E2E tests in a dedicated `tests/` or `e2e/` folder.
3.  **Meaningful Test Names:** Use descriptive names like `it('should calculate the total price including tax')` instead of `it('works')`.
4.  **No Implementation Without a Test:** Never write production code unless it is to make a failing test pass.

---

## 4. Suggested Tooling for this Astro Project

As we are using **Astro**, we recommend:
- **Vitest:** For fast unit and component testing.
- **Playwright:** For end-to-end testing of the final rendered site.

> [!TIP]
> If you haven't installed Vitest yet, let me know and I can help set up the environment.
