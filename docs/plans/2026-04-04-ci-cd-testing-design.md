# CI/CD Testing Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Run all tests (unit, integration, e2e, evals) in GitHub Actions against a real Umbraco instance, blocking PRs to main/dev if tests fail.

**Architecture:** GitHub Actions runs tests on PRs to `main` and `dev`. Branch protection on `main` requires the test workflow to pass before merge. Since Azure Pipelines only triggers on push to `main` (i.e. after merge), failed tests block deployment naturally — no cross-platform integration needed. Eval tests (LLM-driven, costs money) only run on release branch PRs to `main`. Ad-hoc evals can be run locally.

**Tech Stack:** GitHub Actions, SQL Server 2022 (Docker service container), .NET 10.0, Node.js 22, Jest, Playwright, Wrangler

---

### Task 1: Create the GitHub Actions workflow file

**Files:**
- Create: `.github/workflows/test.yml`

**Step 1: Create the workflow directory**

```bash
mkdir -p .github/workflows
```

**Step 2: Write the complete workflow file**

Create `.github/workflows/test.yml` with this content:

```yaml
name: Test

on:
  pull_request:
    branches: [main, dev]

jobs:
  test:
    name: Test Suite
    runs-on: ubuntu-latest

    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2022-latest
        env:
          ACCEPT_EULA: Y
          MSSQL_SA_PASSWORD: Moloko99
        ports:
          - 1433:1433
        options: >-
          --health-cmd "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Moloko99 -C -Q 'SELECT 1' || exit 1"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 10

    env:
      UMBRACO_CLIENT_ID: umbraco-back-office-mcp
      UMBRACO_CLIENT_SECRET: '1234567890'
      UMBRACO_BASE_URL: http://localhost:56472
      NODE_TLS_REJECT_UNAUTHORIZED: '0'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Cache NuGet packages
        uses: actions/cache@v4
        with:
          path: ~/.nuget/packages
          key: nuget-${{ hashFiles('**/*.csproj') }}
          restore-keys: nuget-

      - name: Install npm dependencies
        run: npm ci

      - name: Compile TypeScript
        run: npm run compile

      - name: Build
        run: npm run build

      - name: Configure Umbraco for CI
        run: |
          cat > infrastructure/test-umbraco/MCPTestSite/appsettings.local.json << 'EOF'
          {
            "ConnectionStrings": {
              "umbracoDbDSN": "Server=localhost,1433;Database=umbraco-mcp-ci;User Id=sa;password=Moloko99;TrustServerCertificate=True",
              "umbracoDbDSN_ProviderName": "Microsoft.Data.SqlClient"
            }
          }
          EOF

      - name: Start Umbraco
        run: |
          cd infrastructure/test-umbraco/MCPTestSite
          dotnet run --launch-profile "Umbraco.Web.UI" &

      - name: Wait for Umbraco
        run: |
          echo "Waiting for Umbraco to be ready..."
          for i in $(seq 1 60); do
            if curl -sf http://localhost:56472/umbraco/management/api/v1/server/status > /dev/null 2>&1; then
              echo "Umbraco is ready!"
              exit 0
            fi
            echo "Attempt $i/60 - waiting 5s..."
            sleep 5
          done
          echo "Umbraco failed to start within 5 minutes"
          exit 1
        timeout-minutes: 6

      - name: Run tests
        run: npm test -- --no-coverage

      - name: Run E2E SDK tests
        run: npm run test:e2e-sdk

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright E2E tests
        run: npm run test:e2e

  evals:
    name: LLM Eval Tests
    if: >-
      github.event.pull_request.base.ref == 'main' &&
      startsWith(github.event.pull_request.head.ref, 'release/')
    runs-on: ubuntu-latest

    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2022-latest
        env:
          ACCEPT_EULA: Y
          MSSQL_SA_PASSWORD: Moloko99
        ports:
          - 1433:1433
        options: >-
          --health-cmd "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P Moloko99 -C -Q 'SELECT 1' || exit 1"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 10

    env:
      UMBRACO_CLIENT_ID: umbraco-back-office-mcp
      UMBRACO_CLIENT_SECRET: '1234567890'
      UMBRACO_BASE_URL: http://localhost:56472
      NODE_TLS_REJECT_UNAUTHORIZED: '0'
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'

      - name: Cache NuGet packages
        uses: actions/cache@v4
        with:
          path: ~/.nuget/packages
          key: nuget-${{ hashFiles('**/*.csproj') }}
          restore-keys: nuget-

      - name: Install npm dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configure Umbraco for CI
        run: |
          cat > infrastructure/test-umbraco/MCPTestSite/appsettings.local.json << 'EOF'
          {
            "ConnectionStrings": {
              "umbracoDbDSN": "Server=localhost,1433;Database=umbraco-mcp-ci-evals;User Id=sa;password=Moloko99;TrustServerCertificate=True",
              "umbracoDbDSN_ProviderName": "Microsoft.Data.SqlClient"
            }
          }
          EOF

      - name: Start Umbraco
        run: |
          cd infrastructure/test-umbraco/MCPTestSite
          dotnet run --launch-profile "Umbraco.Web.UI" &

      - name: Wait for Umbraco
        run: |
          echo "Waiting for Umbraco to be ready..."
          for i in $(seq 1 60); do
            if curl -sf http://localhost:56472/umbraco/management/api/v1/server/status > /dev/null 2>&1; then
              echo "Umbraco is ready!"
              exit 0
            fi
            echo "Attempt $i/60 - waiting 5s..."
            sleep 5
          done
          echo "Umbraco failed to start within 5 minutes"
          exit 1
        timeout-minutes: 6

      - name: Run eval tests
        run: npm run test:evals
```

**Step 3: Verify YAML syntax**

```bash
cat .github/workflows/test.yml | python3 -c "import sys,yaml; yaml.safe_load(sys.stdin); print('YAML valid')"
```

Expected: `YAML valid`

**Step 4: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "ci: add GitHub Actions test workflow with SQL Server + Umbraco

Runs unit, integration, E2E SDK, and Playwright tests on PRs to main/dev.
Eval tests run automatically on release branch PRs to main.
Uses SQL Server 2022 service container with Umbraco unattended install."
```

---

### Task 2: Manual configuration (not automatable)

These steps require human action in the GitHub UI:

**Step 1: Add GitHub Actions secret**

In the GitHub repo settings (Settings > Secrets and variables > Actions):
- Add `ANTHROPIC_API_KEY` — your Anthropic API key for eval tests

**Step 2: Configure branch protection on `main`**

In GitHub repo settings (Settings > Branches > Branch protection rules):
- Add rule for `main`
- Enable "Require status checks to pass before merging"
- Search for and add: `Test Suite` (the job name from the workflow)
- Optionally enable "Require branches to be up to date before merging"

---

### Task 3: Verify end-to-end

**Step 1: Create a test PR**

Push the branch with the workflow and open a PR to `dev`.

**Step 2: Verify the test job runs**

- Go to the PR > Checks tab
- Verify "Test Suite" job appears and runs through all steps
- Watch for: SQL Server health check, Umbraco startup, test execution

**Step 3: Verify eval conditional trigger**

- Create a PR from a `release/test` branch to `main`
- Verify the "LLM Eval Tests" job triggers automatically
- Or run evals locally with `npm run test:evals` when needed outside releases

**Step 4: Test failure blocking**

- Introduce a deliberately failing test in the PR
- Verify the status check blocks merge on `main`

**Step 5: Clean up**

- Revert the failing test
- Merge the PR once green

---

## How deployment is protected

```
PR to dev   → GitHub Actions runs: compile, unit, integration, e2e
PR to main  → GitHub Actions runs: compile, unit, integration, e2e
                                   + evals (if source branch is release/*)

Tests must pass (branch protection) → PR can merge → push to main → Azure Pipelines deploys
Tests fail                          → PR blocked   → no merge     → no deploy
```

No cross-platform integration needed. Branch protection is the single gate.
Evals only run on release PRs to main — right before deployment, not on every dev PR.

## Key files reference

| File | Purpose |
|------|---------|
| `.github/workflows/test.yml` | GitHub Actions test workflow (new) |
| `build/azure-pipelines.yml` | Azure Pipelines deploy pipeline (unchanged) |
| `infrastructure/test-umbraco/MCPTestSite/Program.cs` | Loads `appsettings.local.json` in non-production |
| `infrastructure/test-umbraco/MCPTestSite/appsettings.Development.json` | Unattended install config |
| `infrastructure/test-umbraco/MCPTestSite/Properties/launchSettings.json` | Port bindings (44391 + 56472) |
| `.env` | Default MCP credentials |
| `tests/cms-hosted-e2e/helpers/worker-setup.ts` | Wrangler worker lifecycle for Playwright E2E |
| `tests/evals/helpers/e2e-setup.ts` | Eval test framework config |

## Secret required

| Secret | Where | Purpose |
|--------|-------|---------|
| `ANTHROPIC_API_KEY` | GitHub Actions | Eval tests (Claude API calls) |
