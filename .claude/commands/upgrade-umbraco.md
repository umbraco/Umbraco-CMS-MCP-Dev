# /upgrade-umbraco

Upgrade the demo-site Umbraco packages to the latest released version, regenerate the API client, identify schema/endpoint impact on tools and tests, and surface new endpoints for tool creation.

## Usage

```
/upgrade-umbraco                   # upgrade to latest stable
/upgrade-umbraco 17.4.0            # upgrade to a specific version
```

ARGUMENTS: $ARGUMENTS

## Prerequisites

- Local SQL Server reachable from `demo-site/appsettings.local.json`
- A working `.env` with `UMBRACO_CLIENT_ID`, `UMBRACO_CLIENT_SECRET`, `UMBRACO_BASE_URL`
- `dotnet`, `npm`, `curl`, `python3` on PATH
- The `umbraco-back-office-mcp` OAuth client must already exist in the target database (created manually once via the backoffice). Reuse the same DB across upgrades so the client persists; Umbraco will run forward migrations automatically.

## Steps

### 1. Set up an isolated worktree

Use the `superpowers:using-git-worktrees` skill to create `.worktrees/upgrade-umbraco-<version>` on a `chore/upgrade-umbraco-<version>` branch. Run `npm install` and `npm run compile` to confirm a clean baseline before changing anything.

### 2. Identify the target version

If no argument is given, query NuGet for the latest non-prerelease:

```bash
curl -s "https://api.nuget.org/v3-flatcontainer/umbraco.cms/index.json" \
  | python3 -c "import json,sys; d=json.load(sys.stdin); \
      print(next(v for v in reversed(d['versions']) \
      if not any(x in v for x in ['rc','beta','alpha','pre'])))"
```

Also confirm the matching version of `Umbraco.Cms.DevelopmentMode.Backoffice`. `Umbraco.ExaminePDF` is on its own track — check for an updated major if the CMS major changed.

### 3. Update package versions in the template

Edit `demo-site-template/demo-site-template.csproj`:

```xml
<PackageReference Include="Umbraco.Cms" Version="X.Y.Z" />
<PackageReference Include="Umbraco.Cms.DevelopmentMode.Backoffice" Version="X.Y.Z" />
```

`demo-site/` is gitignored — it is regenerated from the template by the bootstrap script.

### 4. Boot the upgraded Umbraco

```bash
npm run umbraco:stop   # in case anything was running
bash scripts/bootstrap-demo-site.sh --force
# Make sure demo-site/appsettings.local.json has the same DB you used previously
npm run umbraco:start  # NuGet restore, build, run forward migrations, listen on 44391/56472
```

Wait until `https://localhost:44391/umbraco` responds. Watch the startup log for migration messages so you know the schema upgraded cleanly.

### 5. Regenerate the OpenAPI client

```bash
npm run generate       # orval reads http://localhost:56472/umbraco/swagger/management/swagger.json
npm run compile        # catch type-level breakages immediately
```

The Orval config lives in `src/umbraco-api/orval/umbraco-api.ts`. The `relaxUuidToGuid` hook rewrites `zod.uuid()` → `zod.guid()` in the generated `*.zod.ts` files.

### 6. Diff the regenerated API surface

Quickly list new vs removed endpoints:

```bash
git show HEAD:src/umbraco-api/api/api/umbracoManagementAPI.ts \
  | grep -oE "\['[a-zA-Z0-9]+'\]" | sort -u > /tmp/api-old-fns.txt
grep -oE "\['[a-zA-Z0-9]+'\]" src/umbraco-api/api/api/umbracoManagementAPI.ts \
  | sort -u > /tmp/api-new-fns.txt
echo "--- NEW endpoints ---"
comm -23 /tmp/api-new-fns.txt /tmp/api-old-fns.txt
echo "--- REMOVED endpoints ---"
comm -13 /tmp/api-new-fns.txt /tmp/api-old-fns.txt
```

Also inspect `git status` for any new schemas in `src/umbraco-api/api/schemas/` and any field-level diffs in modified schemas.

### 7. Fix compile-only breakages

Existing tests sometimes break because a previously-implicit query parameter became required at the type level (e.g. an Orval-generated optional whose `ShapeOutput` insists on a key). The convention here is to pass `field: undefined` in the test object literal — match the pattern used for other optional params in the same file.

If the breakage is structural (a removed endpoint, a renamed field used in tool implementations), fix the offending tool/test and explain the fix in the PR description.

### 8. Run the integration tests

```bash
rm -f test-failures.log
npm test -- --no-coverage
```

Failures fall into three buckets:

1. **Snapshot drift** — additive fields, deprecated markers, or new enum values changed the response shape. Leave these; the user reviews snapshot diffs and accepts via `/accept-snapshot` or `npm test -- -u`.
2. **Type-level breakages from new optional params** — fix per step 7 (add `field: undefined`).
3. **Real regressions** — tool no longer matches the API contract. Investigate and fix the tool.

`test-failures.log` lists failing suites and the first lines of each error; `npm run test:rerun-failures` reruns just those.

### 9. Plan and add tools for new endpoints

For each new endpoint identified in step 6, decide:

- Is it covered by an existing tool? (e.g. `getDataTypeBatch` overlaps with the existing `getItemDataType` items endpoint, but returns full `DataTypeResponseModel` objects rather than lightweight items — both are useful.)
- Is it a meaningful new capability for an LLM caller?

When adding tools, follow the conventions in this codebase (tools live under `src/umbraco-api/tools/<entity>/{get,post,put,delete,items,folders}/`, registered in the entity `index.ts`):

- Use `withStandardDecorators` and `ToolDefinition` (see `.claude/commands/migrate-tools.md`).
- For array responses, wrap in `z.object({ items: ... })`.
- Use `executeGetApiCall` / `executeGetItemsApiCall` / `executeVoidApiCall` from the SDK.
- Add the tool import + registration to the entity's `index.ts` and respect the existing `AuthorizationPolicies` / `slices` pattern.

After each tool, add a smoke test under `src/umbraco-api/tools/<entity>/__tests__/` mirroring the existing builder + helper conventions (Dictionary is the gold standard — see `.claude/memories/cursor-mcp-testing.md`). The integration test should:

- Use `setupTestEnvironment()` and `createMockRequestHandlerExtra()` from `@umbraco-cms/mcp-server-sdk/testing`.
- Arrange via the entity's existing builder.
- Snapshot the result via `createSnapshotResult()` for normalization.

If the new endpoint matches a category for which a skill exists (`umbraco-mcp-skills:add-tool` / `umbraco-mcp-skills:add-test`), prefer the skill. Otherwise hand-author following existing tools as templates.

### 10. Report and hand off

When tests are green (or only have snapshot diffs), summarise:

- Old → new versions
- New endpoints (with the resulting new tool names, if any added)
- Removed endpoints (must always be addressed, as tools depending on them will fail)
- Modified response schemas worth flagging (deprecated fields, additive fields)
- List of tests with snapshot drift the user should review

Then create a PR using `superpowers:finishing-a-development-branch`.

## Common pitfalls

- **Fresh database:** A brand-new DB will not have `umbraco-back-office-mcp` registered; integration tests will 401 with "client application was not found". Reuse the developer DB or register the client in the backoffice once.
- **Two ports:** `44391` (HTTPS) is the browser/OAuth port; `56472` (HTTP) is the server-to-server port and the one Orval and the workerd hosted runtime hit. Both must be listening — never start with `--urls`.
- **`zod.uuid()` vs `zod.guid()`:** Output schemas must accept Umbraco's non-RFC-4122 GUIDs. The `relaxUuidToGuid` hook handles this for generated zod files automatically; check it still applied if a test starts failing on an output validation pipeline.
- **`demo-site/` is gitignored:** Always edit `demo-site-template/`. The site directory is rebuilt by `scripts/bootstrap-demo-site.sh`.
- **Snapshot updates:** Don't run `-u` blindly across the whole suite. The user will accept snapshots per-test on review.

## Reference

- Last-known upgrade: `17.2.2 → 17.3.4` introduced 16 new endpoints (4 batch GETs, 2 allowed-parents, 7 item-ancestors, 2 tree-search, 1 document-public-access query param), plus additive fields on `PublicAccessResponseModel.isProtectedByAncestor`, deprecation marker on `MediaConfigurationResponseModel.disableUnpublishWhenReferenced`, new `RuntimeLevelModel.Upgrading`, and a new `format?` on `getImagingResizeUrlsParams`.
