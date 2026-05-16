# Auto-commit (semantic, grouped)

Create one or more **Conventional Commits** from the current working tree. Split changes into **separate commits** when they belong to different logical subjects. Do not ask for confirmation unless something is ambiguous or unsafe.

## Goals

- **Semantic:** Every commit uses [Conventional Commits](https://www.conventionalcommits.org/) (`type`, optional `scope`, imperative subject).
- **Grouped:** Related files land in the **same** commit; unrelated changes get **separate** commits (smallest sensible set, usually 1–5 commits).
- **Automatic:** Inspect, group, stage, and commit without waiting for the user to approve each message (unless blocked below).

## Preconditions

- Run only when the user invoked `/auto-commit` or explicitly asked for this workflow.
- **Do not push** unless the user also asked to push.
- **Do not** amend, rebase, or use destructive git commands.
- **Never** stage or commit secrets or local-only artifacts (see [Never commit](#never-commit)).

## Step 1 — Gather state (parallel)

Run these in parallel:

```bash
git status --short
git diff
git diff --cached
git log -8 --oneline
```

If there is nothing to commit (clean tree), report that and stop.

## Step 2 — Group changes by subject

Partition **every** changed path (staged and unstaged) into groups. Each group becomes **one** commit.

### Grouping rules (apply in order)

1. **Same feature / area** — e.g. `src/components/Admin/*`, `src/lib/db.ts` + `src/server/api-router.ts` for one API change, `docs/*` for doc-only edits.
2. **Same conventional type** — do not mix `feat` and `fix` in one commit unless they are inseparable (same bugfix + its test in one PR-sized change).
3. **Tests with implementation** — `*.test.ts(x)` with the source they cover when the test exists only for that change.
4. **Tooling / config / deps** — `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `.vscode/*`, CI, `emberkit.config.ts` → usually `chore` or `build` in dedicated commit(s), not mixed with product code unless trivial one-liner.
5. **Docs-only** — `docs/`, `README.md`, `AGENTS.md`, `*.md` skills → `docs` commit(s), separate from runtime code when possible.
6. **Revert / delete-only** — isolated `revert` or `chore` commit when it tells a clear story.

When unsure between one or two commits, **prefer two** if the subjects differ (e.g. "fix premium select" vs "update AGENTS.md").

### Scope hints (this repo)

| Area | Suggested scope |
| --- | --- |
| Admin UI | `admin` |
| Blog / public content | `blog` |
| API / worker | `api` |
| DB / libSQL | `db` |
| i18n | `i18n` |
| UI components (shared) | `ui` |
| EmberKit / build | `build` |
| Tests only | `test` |
| Docs | omit scope or `docs` |

Match recent `git log` style for capitalization and scope naming.

## Step 3 — Commit message format

**Subject:** `<type>(<scope>): <imperative summary>`

| Type | Use when |
| --- | --- |
| `feat` | New behavior or capability |
| `fix` | Bug fix |
| `refactor` | Behavior-preserving restructure |
| `perf` | Performance improvement |
| `docs` | Documentation only |
| `test` | Tests only (no prod code) |
| `chore` | Maintenance, tooling, misc |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `style` | Formatting only (no logic) |
| `revert` | Reverts a prior commit |

**Rules:**

- Imperative mood: "add", "fix", "remove" — not "added" / "adding".
- Subject ≤ 72 characters; no trailing period.
- **Body** only when the *why* is not obvious, or for breaking changes / security / migrations.
- Optional footer: `Closes #123`, `Refs #123` if branch or context includes an issue id.

## Step 4 — Create commits (sequential, one group at a time)

For **each** group, in a sensible order (dependencies / lib first, then features, then docs/chore):

1. Stage **only** that group's paths (`git add -- <paths…>`). Never `git add -A` across unrelated groups.
2. Verify: `git diff --cached --stat`
3. Commit with a HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <Subject>

Optional body explaining why.

EOF
)"
```

4. After all groups: `git status` and a short summary listing each commit hash, subject, and files included.

If a **pre-commit hook** fails: fix the issue if straightforward, then create a **new** commit for that group (do not amend unless project rules explicitly allow it).

## Never commit

Exclude from staging (warn in the summary if present):

- `.env`, `.env.local`, `.dev.vars` (non-example)
- `db.sqlite`, `local.db`
- `node_modules/`, `dist/`, `.wrangler/`
- Any file that looks like credentials, tokens, or private keys

## Ambiguity and safety

- **Single trivial change** (one file, obvious type): one commit, no questions.
- **Mixed unrelated large changes:** split into multiple commits; list the plan in one short bullet list before committing, then execute without further prompts.
- **Cannot classify a file:** put it in its own `chore` commit or ask the user once — do not guess secrets into the repo.
- **Already partially staged:** respect existing staging only if it matches a single group; otherwise `git reset` mixed staging is **not** allowed — use `git restore --staged <file>` per file to realign groups without discarding working tree changes.

## Example outcome

Three commits from one session:

1. `fix(ui): close premium select on outside click` — `PremiumSelect.tsx`, `premium-select-init.ts`, tests
2. `refactor(db): consolidate schema bootstrap` — `db.ts`, `emberkit.config.ts`
3. `docs: add agent onboarding notes` — `AGENTS.md`, `README.md`

## Output to user

When finished, report:

- Number of commits created
- One line per commit: ``<hash> <subject>`` (`<n>` files)
- Anything left unstaged and why
- Reminder that push was not performed (unless they asked to push)
