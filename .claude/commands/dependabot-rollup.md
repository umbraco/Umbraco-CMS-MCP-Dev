---
description: Roll every open Dependabot SECURITY update (excluding semver-major bumps) into a single chore branch + PR against dev, drive it to green CI via /goal, close the superseded individual Dependabot PRs, and only then notify the human to review. Designed to run unattended as a scheduled routine.
argument-hint: "(no args — reads open Dependabot PRs and security alerts directly)"
---

# /dependabot-rollup

Consolidate all **open Dependabot security updates** into one `chore/` branch that merges into **`dev`**, verify it to green CI, delete (close + delete-branch) the individual Dependabot PRs the rollup supersedes, and notify the human **only when everything is done**.

This command is built to run **unattended on a schedule**. It must be safe to run when there is nothing to do (quiet no-op), and it must never lose work: individual Dependabot PRs are closed **only after** the rollup PR's CI is fully green.

ARGUMENTS: $ARGUMENTS (ignored — state comes from GitHub)

## Guardrails (read first)

- **Security-only.** Only include Dependabot PRs that bump at least one package with an **open Dependabot security alert**. Routine version-bump PRs with no security alert are left untouched.
- **No major bumps — ever.** Any PR whose targeted package crosses a **semver-major** boundary (e.g. `uuid 11 → 14`) is **excluded** and listed for separate, one-to-one handling. This includes multi-package Dependabot PRs where *any* bundled package is a major bump — if a bundle can't be split cleanly, defer the whole bundle rather than pull in a major.
- **Base branch is `dev`.** Never target `main`. (Per gitflow: `dev` is the integration branch.)
- **Destructive step is gated.** Closing/deleting the individual Dependabot PRs happens **after** CI is green, not before.
- **Quiet when idle.** If there are no in-scope security PRs, log that and stop. Do **not** create a branch, open a PR, or send a notification.
- **Notify once, at the end.** The human is pinged to review exactly once, only when the rollup PR is open, CI is fully green, and the superseded PRs are closed.

## Procedure

### 1. Preflight

```bash
gh auth status                      # must be authenticated
git worktree list                   # operate in the MAIN worktree, not a feature worktree
git fetch origin --prune
git switch dev && git pull --ff-only origin dev
```

If the working tree is dirty or you're on a feature branch/worktree you can't safely leave, stop and report — do not stash or force.

### 2. Discover in-scope PRs

Pull the two sources and intersect them.

```bash
# Open Dependabot PRs
gh pr list --state open --app dependabot \
  --json number,title,headRefName,url --limit 100

# Open security alerts → the set of packages with a live advisory
gh api repos/:owner/:repo/dependabot/alerts \
  --jq '.[] | select(.state=="open") | .dependency.package.name' | sort -u
```

For each open Dependabot PR, parse the package(s) and the `from → to` versions from the title (e.g. `bump hono from 4.12.18 to 4.12.28`, or a multi-package `bump undici and wrangler`). Use the PR body / `gh pr view <n>` when the title is a bundle and you need the exact per-package versions.

A PR is **in scope** when **both**:
1. At least one package it bumps appears in the open-security-alerts set, **and**
2. **No** package it bumps crosses a major version boundary (`major(to) > major(from)`).

Classify every open Dependabot PR into one of:
- **INCLUDE** — security + non-major → goes into the rollup.
- **DEFER-MAJOR** — security but crosses a major → excluded, reported for one-to-one handling.
- **SKIP-NONSECURITY** — no open security alert → left alone (not our job here).

If **INCLUDE is empty**: log the classification summary and **stop** (quiet no-op — no branch, no PR, no notification). If there are DEFER-MAJOR items, still surface them (see step 8) even on an otherwise-idle run, since a human needs to action them — but do this as a lightweight note, not the full "review the PR" ping.

### 3. Reuse or create the rollup branch/PR (idempotent)

A previous scheduled run may have left an open rollup PR. Check first:

```bash
gh pr list --state open --base dev --head-prefix chore/dependabot-security-rollup --json number,headRefName,url
```

- If one exists, check it out and **update** it (re-run steps 4–6 on top of a fresh rebase onto `dev`). Do not open a second rollup PR.
- Otherwise create a dated branch off `dev`:

```bash
git switch -c chore/dependabot-security-rollup-$(date +%Y-%m-%d)
```

### 4. Apply the bumps

Faithfully capture what Dependabot resolved (covers both direct and transitive deps) by merging each INCLUDE branch, then reconcile the lockfile deterministically:

```bash
for BRANCH in <each INCLUDE headRefName>; do
  git merge --no-edit "origin/$BRANCH" || {
    # Lockfile conflict is expected when several PRs touch package-lock.json.
    # Resolve by regenerating: keep package.json changes, rebuild the lock.
    git checkout --theirs package-lock.json 2>/dev/null || true
    git add -A
    git commit --no-edit
  }
done

npm install            # reconcile package-lock.json to a single coherent tree
```

For **.NET/NuGet** security PRs (e.g. `Umbraco.Cms` in `demo-site-template/`), apply the version bump to the `.csproj` directly rather than merging, since the npm lockfile flow doesn't apply — again, only if it's non-major.

After applying, sanity-check locally (fast checks only — full test verification is CI's job per the guardrails):

```bash
npm run compile
npm run build
```

If compile/build fails because of a bump, diagnose and fix it here (that's part of getting to a mergeable state). If a single package is irreconcilable, drop just that package from the rollup and move it to DEFER-MAJOR-style reporting rather than blocking the whole batch.

### 5. Commit & push

```bash
git add -A
git commit -m "chore(deps): roll up Dependabot security updates into dev"   # only if merges left staged changes
git push -u origin HEAD
```

### 6. Open (or update) the rollup PR into `dev`

Body must list, per included package: name, `from → to`, and highest open advisory severity — plus a **Deferred (major — handle separately)** section listing every DEFER-MAJOR PR with its number and link, and a **Supersedes** line referencing every INCLUDE PR number.

```bash
gh pr create --base dev --title "chore(deps): security rollup ($(date +%Y-%m-%d))" --body "<generated body>"
# or: gh pr edit <n> --body "<regenerated body>"  when updating an existing rollup PR
```

### 7. Drive to green CI with /goal — THE LOOP

`/goal` is a native Claude Code command — `/goal [condition|clear]`. It sets a goal condition and Claude keeps working **across turns** until the condition is met (`/goal` with no arg shows the current goal; `/goal clear` cancels it). Set the goal to the rollup's full definition of done so the CI fix-loop runs to completion without stopping early. Substitute the real rollup PR number:

```
/goal rollup PR #<ROLLUP> targets dev, all its CI checks are green, and every superseded Dependabot PR is closed with its branch deleted
```

Then work the loop until the goal is satisfied:

- Poll `gh pr checks <ROLLUP> --watch` (blocks until checks settle) rather than busy-waiting.
- On any failure: `gh run view --job <id> --log-failed`, fix the root cause in code, commit, push, and re-poll. Treat a CI failure as a real regression to fix — never hand a red PR to the human.
- **Only once CI is fully green**, close each superseded Dependabot PR and delete its branch (this is part of meeting the goal, not a step after it):

```bash
gh pr close <n> --comment "Superseded by #<ROLLUP> — rolled into the security rollup." --delete-branch
gh pr view <n> --json state    # verify closed
```

The goal is not met — and you must not notify the human — until CI is green **and** every superseded PR is closed. Use `/goal clear` if you abort.

### 8. Report deferred majors

In the final notification (and, on idle runs, as a lightweight standalone note), list every DEFER-MAJOR PR: package, `from → to`, severity, PR link, and the reminder that **majors are handled separately on a one-to-one basis** — this command never merges them.

### 9. Notify — only now

Only after step 7's definition of done holds, notify the human to review the rollup PR. Include: the rollup PR link, the count + names of included security fixes, the list of closed/superseded PRs, and the deferred-majors list. This is the single "please review" ping.

## Success criteria (what "complete" means)

- ✅ One `chore/dependabot-security-rollup-*` PR open against `dev` containing all in-scope security bumps.
- ✅ All CI checks on that PR green.
- ✅ Every superseded individual Dependabot PR closed with its branch deleted.
- ✅ Zero major bumps merged; all majors reported for separate handling.
- ✅ Human notified exactly once, at the end — or a quiet no-op if nothing was in scope.

## Running as a scheduled routine

This command is registered as a scheduled cloud agent (see `/schedule` list). The routine invokes `/dependabot-rollup` on its cadence; the notification in step 9 is the only time it should surface to you. To change cadence or pause it, use `/schedule`.
