# Umbraco CMS MCP — Repository Conventions

This file is the canonical conventions source for build agents and MCP tooling.
The detailed rules live in `.rulesync/rules/*.md`; this file summarises the
build/test/tooling conventions and points at them.

## Rule references

- `.rulesync/rules/cursor-mcp.md` — MCP development guide (tools, resources, Umbraco API integration)
- `.rulesync/rules/cursor-mcp-testing.md` — testing guide (builders, helpers, snapshot testing)
- `.rulesync/rules/cursor-model-context-provider-typescript.md` — MCP TypeScript SDK reference
- `.rulesync/rules/cursor-project-context.md` — project context and background
- `.rulesync/rules/schema-flattening-addition-for-folders.md` — folder schema flattening notes

## Project layout

- MCP tools live at `src/umbraco-api/tools/`, grouped by entity and REST verb (get/post/put/delete).
- The Orval-generated Umbraco Management API client lives at `src/umbraco-api/api/`.
- The Orval config is `src/umbraco-api/orval/umbraco-api.ts` (wrapped by the root `orval.config.ts`).
- Path aliases: `@/umbraco-api/*` → `src/umbraco-api/api/*`; `@umb-management-client` → `src/umbraco-api/umbraco-management-client.ts`.

## Build / test / tooling

- `npm run compile` — tsc type-check (safe to run anytime).
- `npm run build` — tsup build.
- `npm run generate` — regenerate the Orval client (requires Umbraco running, plus
  `UMBRACO_BASE_URL`/`UMBRACO_CLIENT_ID`/`UMBRACO_CLIENT_SECRET` in `.env` — the SDK's
  target-major transformer reads the instance's version to stamp
  `src/config/umbraco-target.generated.ts`, and fails the run if it can't).
- `npm test` — integration/unit suite (requires Umbraco running).
- `npm run test:one -- <path-to-test>` — run a single test file (`--runInBand --forceExit`, no path pattern).
- `npm run test:evals` — eval tests (requires Umbraco running).
- `npm run test:all` — full pass: `build` + integration (`test`) + `test:evals`.
- `npm run start:umbraco` — alias of `npm run umbraco:start`; starts the demo-site Umbraco instance.

Jest requires `node --experimental-vm-modules` for ESM support — always use the npm scripts rather than `npx jest`.

## GUID validation: uuid() vs guid()

Umbraco returns GUIDs that are not RFC 4122 compliant (e.g. sequential version IDs like `0000003f-0000-0000-0000-000000000000`). Zod's `uuid()` rejects these, but `guid()` accepts any 8-4-4-4-12 hex string.

**Rules:**
- **Input schemas** (what the LLM sends) → use `uuid()` for strict validation
- **Output schemas** (what Umbraco returns) → use `guid()` to tolerate non-RFC 4122 IDs
- **Generated zod file** → the Orval post-processing hook in `src/umbraco-api/orval/umbraco-api.ts` relaxes `zod.uuid()` to `zod.guid()` after generation. This applies globally because the generated schemas are used for output validation.
- **Hand-written tool schemas** → use `uuid()` in input schemas, `guid()` in output schemas

**Tests** (in `src/umbraco-api/tools/__tests__/`):
- `guid-not-uuid.test.ts` — verifies the generated file has no `zod.uuid()` calls
- `output-schema-umbraco-compat.test.ts` — validates all output schemas accept Umbraco-realistic data through the MCP SDK's actual validation pipeline

## Umbraco Test Instance

The test Umbraco instance lives at `demo-site`.

### Starting Umbraco

```bash
npm run start:umbraco   # alias of npm run umbraco:start
```

This starts Umbraco on two ports (both are required):
- **https://localhost:44391** — browser-facing (OAuth authorize, backoffice UI)
- **http://localhost:56472** — server-to-server (token exchange from Cloudflare Workers)

The HTTP port is needed because workerd (Cloudflare Workers runtime) cannot verify self-signed TLS certs. OpenIddict's transport security requirement is disabled in Development mode via `Configure<OpenIddictServerAspNetCoreOptions>` in `Program.cs`.

Do NOT start Umbraco with `--urls` as this overrides the launch settings and only binds one port.

### Stopping Umbraco

```bash
npm run umbraco:stop
```

### Running tests

**Important:** Do NOT run integration tests unless explicitly asked. They require Umbraco running and hit real API endpoints — they are slow, can modify data, and should only be run intentionally.

```bash
# Integration tests (requires Umbraco running) — only when asked
npm run start:umbraco
npm test -- --no-coverage <path-to-test>

# Single test file
npm run test:one -- <path-to-test>

# Full pass (build + integration + evals)
npm run test:all

# Hosted MCP E2E tests (requires Umbraco running) — only when asked
npm run start:umbraco
npm run test:e2e

# Eval tests (requires Umbraco running) — only when asked
npm run test:evals

# Compile check — safe to run anytime
npm run compile
```

### Test failure workflow

A custom Jest reporter writes `test-failures.log` after every test run. The file contains the failing suite paths, test names, and first few lines of each error. It is automatically deleted when all tests pass.

- **After a full test run**, always read `test-failures.log` to identify failures rather than scrolling through terminal output.
- **To rerun only the failures**: `npm run test:rerun-failures`
- **To check for flakiness**, rerun failures and compare — if they pass on retry, they were flaky.

### Stale test data

File-based entities (partial views, scripts, stylesheets) live on the filesystem. If tests fail mid-run, stale files can be left behind causing subsequent test failures (duplicate items, wrong tree counts). To reset:

1. Delete stale files from `demo-site/Views/Partials/` and `wwwroot/scripts/`
2. Or recycle the database: change the DB name in `demo-site/appsettings.local.json` and restart Umbraco

When you recycle the database (or otherwise create a new one), always create the MCP API user afterwards — the integration/E2E tests authenticate as that user and will fail with 401 until it exists:

```bash
node scripts/create-api-user.mjs
```

The script is idempotent (it checks for the user first and exits if already present).

## Branching & releases

This repo maintains **two live majors in parallel**, each with its own gitflow pair. The
generic `release-and-branching` skill assumes a single `dev`/`main` pair — that is only true
of the 18 line here, so the table below wins over the skill.

| Line | Status | Work branches off | Release PR into | Latest tag |
|---|---|---|---|---|
| **18.x** | current | `dev` | `main` | `v18.1.2` |
| **17.x** | **maintained (LTS)** | `v17/dev` | `v17/main` | `v17.6.3` |
| **16.x** | archived — no `v16/dev`, don't target it | — | — | `v16.0.1` |

`main` is and stays the repo's **default branch**. Don't retarget PRs at `main` or move the
default branch to make GitHub's closing keywords fire (see *Issue lifecycle* below) — that
would break the release flow.

### Picking a line

Work goes on the **18 line by default**: branch off `dev`, PR into `dev`, squash-merge.
Only branch off `v17/dev` when the issue is explicitly a 17.x fix.

**Do not create back-ports to the 17 line.** A fix landing on `dev` is 18-only unless a
maintainer explicitly asks for a 17 back-port — don't open back-port PRs or issues off your
own judgement, and don't treat "17 is still supported" as a standing instruction to port.

### Cutting a release

Same shape on both lines, one level over:

1. Branch `release/<version>` off the line's dev branch (`dev`, or `v17/dev`).
2. Bump the version and verify no stale version strings remain.
3. PR into the line's main branch (`main`, or `v17/main`).
4. Merge with a **merge commit, never a squash** — `release-tag.yml` keys off the real
   version-bump commit.

`release-tag.yml` then tags `v<version>` and creates the GitHub Release. It exists on both
lines, each triggering on its own branch (`main` on the 18 line, `v17/main` on the 17 line).

**Merge-back differs between the lines:** the 18 line has `sync-main-to-dev.yml`, which
merges `main` back into `dev` automatically. The 17 line has **no such workflow** — after a
17.x release, merge `v17/main` back into `v17/dev` by hand via a
`chore/merge-v17-main-to-v17-dev` branch (as in #418, #411).

### Issue lifecycle & labels

Issues move through one stage label at a time:

| Label | Meaning |
|---|---|
| `ready-for-ai` | queued for the issue loop to build. Adding it triggers a build. |
| `generated-by-ai` | built — a PR is open. |
| `ready-for-release` | the PR is **merged**, but the fix hasn't shipped in a tag yet. |

**Close issues at release, not at merge.** An issue stays open with `ready-for-release` from
the moment its PR merges until the version containing it is tagged — that's what makes
"finished but not released" visible on the board. Filter `label:ready-for-release` to see
exactly what a pending release will close.

This is manual by necessity: `main` is the default branch, and GitHub only fires a PR's
`Closes #N` keyword on a merge into the **default** branch. Merges into `dev`, `v17/dev` or
`v17/main` never auto-close their linked issue, so nothing closes at merge time and nothing
closes at release time either — closing out `ready-for-release` issues is a step in cutting
a release.

## PR / CI workflow

Whenever you create a new PR or push updates to an existing PR, do NOT consider the task done at push time. Watch the CI checks and fix any failures automatically:

1. Open / update the PR (`gh pr create` / `git push`).
2. Poll `gh pr checks <number>` until every required check has reported (or until a check has clearly failed).
3. For any failing check, run `gh run view <run-id> --log-failed` (or `gh run view --job <job-id> --log-failed`) to read the failure, diagnose the root cause, fix it in code or the workflow, and push a new commit.
4. Loop on steps 2-3 until all required checks are green.
5. Only then report the PR as ready for review.

Treat a CI failure the same as a local test failure — it's a real regression that blocks shipping. Don't ask the reviewer to investigate something the logs already explain.
