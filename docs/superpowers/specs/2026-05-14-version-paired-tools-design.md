# Version-Paired Tools for Pre/Post Umbraco 17.4

**Date:** 2026-05-14
**Status:** Approved
**Author:** Phil Whittaker

## Problem

Umbraco 17.4 adds and changes API endpoints. We need to expose tools that work on both pre-17.4 and 17.4+ Umbraco instances, while keeping the **same registered tool name and the same input/output schema** on both sides.

This matters because:

1. The editor MCP chains into the CMS MCP via `chainCms<TName extends CmsToolsName>(...)`. The tool name set and per-tool input/output types are generated at build time from this repo's collection registry into `dist/tool-types.d.ts`. If a name or shape diverges between pre/post-17.4, the chained call site loses its compile-time contract.
2. Editor MCP tools also compose CMS tools by name inside their own handlers (e.g. `save-and-publish` calls `chainCms("get-document-by-id", …)`). A version-dependent rename or shape change silently breaks composition.
3. LLM tool-use patterns, evals, and few-shot examples key on tool name + schema. A version-dependent surface forces every consumer to fork by version.

Per the constraint set in brainstorming: **shape stability beats correctness for the older branch.** The pre-17.4 surface may return canned data; what it must not do is change shape.

## Design

### Tool model

For every tool that needs a 17.4 split:

- **One registered tool.** One `name`, one `inputSchema`, one `outputSchema`, sourced from the 17.4 contract.
- **Post-17.4 handler.** Hits the real API and returns the response.
- **Pre-17.4 handler.** Reads a co-located JSON fixture shaped exactly like the 17.4 response and returns it. No API call.
- **Dispatch.** A local `withVersionDispatch({ pre174, post174 })` helper picks the handler at call time based on a project-local version flag.

Internally lossy is acceptable. Externally — the schema, the name, the registration — is frozen across versions.

### File layout (per paired tool)

```
src/.../some-tool.ts            # ToolDefinition + schema + dispatch
src/.../some-tool.pre174.json   # canned response, shaped to the 17.4 schema
src/.../some-tool.post174.ts    # handler that calls the API
```

For read tools, the fixture is plausible sample data shaped to the schema.

For write tools whose 17.4 implementation is genuinely new, the fixture is a JSON-encoded MCP error result ("not supported on Umbraco < 17.4"). Same mechanism, different content — decision is per-tool, expressed by what the `.pre174.json` contains, and called out with a one-line comment in the `tool.ts` file (`// pre-17.4: returns "not supported" error result`).

### Version flag (project-local, no SDK changes)

A small module owned by this repo:

```ts
// src/umb-management-api/umbraco-version.ts
let umbracoVersion: string | null = null;
export const setUmbracoVersion = (v: string) => { umbracoVersion = v; };
export const isAtLeast = (target: string): boolean => { /* semver compare; false if null */ };
```

Populated once at boot in `src/index.ts`, right after the existing `checkUmbracoVersion` call at line 55. The existing call already fetches `getServerInformation()`; the refactor either reuses that fetch's result or makes a second call — whichever is cleaner. The version value is the same one the SDK is already reading; we're just keeping it locally as well so per-tool handlers can read it.

### Dispatch helper

```ts
// src/umb-management-api/version-dispatch.ts
import { isAtLeast } from "./umbraco-version.js";

export function withVersionDispatch<I, O>(opts: {
  pre174: (input: I) => Promise<O> | O;
  post174: (input: I) => Promise<O> | O;
}): (input: I) => Promise<O> {
  return async (input) => (isAtLeast("17.4") ? opts.post174 : opts.pre174)(input);
}
```

Forward-default: if `umbracoVersion` is unknown (network failure during boot), `isAtLeast("17.4")` returns `false`, so we **fall back to the fixture** for safety rather than calling an API that might not exist. This is the reverse of the brainstorming default and is preferred because the fixture is guaranteed to be schema-valid; an unknown-version API call could 404.

### Fixture loader

```ts
// src/umb-management-api/read-fixture.ts
import { readFileSync } from "node:fs";
// Accepts a path string or a `new URL(..., import.meta.url)` instance — both are
// valid for readFileSync. Callers use the URL form so paths stay relative to the
// importing module under ESM resolution.
export const readFixture = <T>(path: string | URL): T =>
  JSON.parse(readFileSync(path, "utf8")) as T;
```

`some-tool.ts` calls `readFixture(new URL("./some-tool.pre174.json", import.meta.url))` once at module load and reuses the parsed object inside the pre-17.4 handler. Avoids per-call disk I/O.

### Tool definition shape (illustrative)

```ts
// src/.../some-tool.ts
import { z } from "zod";
import { type ToolDefinition, withStandardDecorators } from "@umbraco-cms/mcp-server-sdk";
import { withVersionDispatch } from "@/umb-management-api/version-dispatch.js";
import { readFixture } from "@/umb-management-api/read-fixture.js";
import { post174 } from "./some-tool.post174.js";

const inputSchema = z.object({ /* unified */ }).shape;
const outputSchema = z.object({ /* unified, 17.4 shape */ });

const fixture = readFixture<z.infer<typeof outputSchema>>(
  new URL("./some-tool.pre174.json", import.meta.url)
);

const Tool = {
  name: "some-tool",
  description: "…",
  inputSchema,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ["list"],
  handler: withVersionDispatch({
    pre174: () => ({ content: [{ type: "text" as const, text: JSON.stringify(fixture) }] }),
    post174,
  }),
} satisfies ToolDefinition<typeof inputSchema, typeof outputSchema.shape>;

export default withStandardDecorators(Tool);
```

The post-17.4 file is a plain handler:

```ts
// src/.../some-tool.post174.ts
export const post174 = async (input: …) => { /* executeGetApiCall(...) */ };
```

### Tests

One new sweep test, registry-wide:

- Walks `availableCollections`.
- For every tool whose default export is built via `withVersionDispatch`, verifies the colocated `*.pre174.json` exists, loads it, and asserts `outputSchema.parse(fixture)` passes.

Failure mode: fixture drifts from schema → test fails at PR time.

Existing per-tool integration tests do not change — they still hit the registered tool by name and pass against whichever Umbraco version is running.

A small unit test for `isAtLeast()` covers boundary cases (`"17.3.9"`, `"17.4.0-beta.1"`, `"17.4.0"`, `"18.0.0"`, `null`).

### Boot wiring

`src/index.ts` is the only call site changed:

```ts
const serverInfo = await client.getServerInformation();
setUmbracoVersion(serverInfo.version);
await checkUmbracoVersion({
  mcpVersion: packageJson.version,
  client: { getServerInformation: async () => serverInfo },
});
```

The second `getServerInformation()` argument is replaced with a cached value to avoid a second network round-trip.

### Editor MCP impact

None. `chainCms("some-tool", …)` keeps its typing. The post-build `umbraco-mcp-generate-types` walks the collections registry and sees one `ToolDefinition` per name with one schema.

## Migration

1. Land the three files (`umbraco-version.ts`, `version-dispatch.ts`, `read-fixture.ts`) plus the registry sweep test. No tool changes yet.
2. Wire `setUmbracoVersion` into `src/index.ts`.
3. Pilot on `get-culture` (the only existing file with a documented 17.4 marker, in `src/umb-management-api/tools/culture/get-cultures.ts`). The current workaround in that file becomes the post-17.4 handler's response normalisation; the pre-17.4 fixture replaces it once 17.4 ships. Use this as the worked example in the repo.
4. From then on, any 17.4-touched tool gets a `*.pre174.json` sibling and the dispatch wrapper.

## Out of scope

- SDK changes. Everything lives in this repo.
- Tools without a 17.4 split. They continue to use a single handler as today.
- Per-minor-version dispatch beyond 17.4. If we need a 17.5 split later, generalise the helper then; not now.
- Runtime version re-detection (Umbraco restarted at a different version mid-session). Same behaviour as today's `checkUmbracoVersion` — boot-time only.
