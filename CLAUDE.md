# Umbraco CMS MCP — Repository Conventions (v17 line)

This file is the canonical conventions source for build agents and MCP tooling
on the **v17 LTS branch** (`v17/dev`). The detailed rules live in
`.rulesync/rules/*.md`; this file summarises the build/test/tooling conventions
and points at them.

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

## Dependencies

This branch targets the v17 LTS line and pins the hosted/SDK packages to the
matching major:

- `@umbraco-cms/mcp-hosted@^17.0.0-beta.28`
- `@umbraco-cms/mcp-server-sdk@^17.0.0-beta.28`

Do not bump these across a major version without following the upgrade process.

## Build / test / tooling

- `npm run compile` — tsc type-check (safe to run anytime).
- `npm run build` — tsup build.
- `npm run generate` — regenerate the Orval client (requires Umbraco running).
- `npm test` — integration/unit suite (requires Umbraco running).
- `npm run test:one -- <path-to-test>` — run a single test file (`--runInBand --forceExit`, no path pattern).
- `npm run test:evals` — eval tests (requires Umbraco running).
- `npm run test:e2e-sdk` — MCP SDK end-to-end tests (requires Umbraco running).
- `npm run test:e2e` — hosted CMS Playwright E2E tests (`tests/cms-hosted-e2e/`, requires Umbraco running).
- `npm run test:all` — full pass: `build` + integration (`test`) + `test:evals`.
- `npm run start:umbraco` — alias of `npm run umbraco:start`; starts the demo-site Umbraco instance.
- `npm run dev:hosted` — run the hosted worker locally (`wrangler dev`).

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
npm run test:e2e-sdk   # MCP SDK E2E
npm run test:e2e       # hosted CMS Playwright E2E

# Eval tests (requires Umbraco running) — only when asked
npm run test:evals

# Compile check — safe to run anytime
npm run compile
```

### Test failure workflow

A custom Jest reporter (`jest-failure-reporter.ts`) writes `test-failures.log` after every test run. The file contains the failing suite paths, test names, and first few lines of each error. It is automatically deleted when all tests pass.

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

## PR / CI workflow

Whenever you create a new PR or push updates to an existing PR, do NOT consider the task done at push time. Watch the CI checks and fix any failures automatically:

1. Open / update the PR.
2. Poll the PR checks until every required check has reported (or until a check has clearly failed).
3. For any failing check, read the failure log, diagnose the root cause, fix it in code or the workflow, and push a new commit.
4. Loop on steps 2-3 until all required checks are green.
5. Only then report the PR as ready for review.

Treat a CI failure the same as a local test failure — it's a real regression that blocks shipping. Don't ask the reviewer to investigate something the logs already explain.
