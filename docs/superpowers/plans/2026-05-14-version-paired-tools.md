# Version-Paired Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Support one tool name + one input/output schema across pre/post Umbraco 17.4, with the pre-17.4 handler returning a JSON fixture instead of calling the API.

**Architecture:** Three small project-local modules (`umbraco-version`, `version-dispatch`, `read-fixture`) live at `src/umb-management-api/version/`. The boot in `src/index.ts` captures the Umbraco version once. Per-tool: one `.ts` (schema + dispatch), one `.pre174.json` (fixture), one `.post174.ts` (API call). A registry sweep test validates every fixture against its tool's `outputSchema`.

**Tech Stack:** TypeScript (ESM, NodeNext), Zod, Jest with `--experimental-vm-modules`, `@umbraco-cms/mcp-server-sdk`. No new dependencies.

**Reading list (skim before starting):**
- Spec: `docs/superpowers/specs/2026-05-14-version-paired-tools-design.md`
- Existing version check call: `src/index.ts:55-59`
- Existing pilot tool: `src/umb-management-api/tools/culture/get-cultures.ts`
- Existing cross-cutting test pattern: `src/umb-management-api/tools/__tests__/guid-not-uuid.test.ts`
- Existing tool patterns: any `*.ts` under `src/umb-management-api/tools/document/get/`
- `CLAUDE.md` — note the "do not run integration tests unless asked" rule

**General notes:**
- Run `npm run compile` after every code edit before committing.
- Run `npm test -- --no-coverage <path>` for unit tests (single file).
- Do NOT run integration tests (`umbraco:start` + full `npm test`) unless the user asks. The pilot tool change in Task 6 will eventually want a manual integration run, but only after the user requests it.
- All new files are ESM. Use `.js` import suffix in TypeScript imports (NodeNext rule).
- Tool files use the `import.meta.url` pattern for resolving fixture paths.

---

### Task 1: Create the version flag module

Project-local module that stores the Umbraco version and answers "are we at least X?" questions.

**Files:**
- Create: `src/umb-management-api/version/umbraco-version.ts`
- Create: `src/umb-management-api/version/__tests__/umbraco-version.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/umb-management-api/version/__tests__/umbraco-version.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  setUmbracoVersion,
  resetUmbracoVersion,
  isAtLeast,
} from "../umbraco-version.js";

describe("umbraco-version", () => {
  beforeEach(() => {
    resetUmbracoVersion();
  });

  it("returns false when version is unknown", () => {
    expect(isAtLeast("17.4")).toBe(false);
  });

  it("returns true when version equals target", () => {
    setUmbracoVersion("17.4.0");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("returns true when version exceeds target by minor", () => {
    setUmbracoVersion("17.5.0");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("returns true when version exceeds target by major", () => {
    setUmbracoVersion("18.0.0");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("returns false when version is below target by minor", () => {
    setUmbracoVersion("17.3.9");
    expect(isAtLeast("17.4")).toBe(false);
  });

  it("returns false when version is below target by major", () => {
    setUmbracoVersion("16.99.99");
    expect(isAtLeast("17.4")).toBe(false);
  });

  it("treats pre-release suffixes as equal to base version", () => {
    setUmbracoVersion("17.4.0-beta.1");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("accepts a two-part target like 17.4", () => {
    setUmbracoVersion("17.4.2");
    expect(isAtLeast("17.4")).toBe(true);
  });

  it("ignores garbage version strings (treats as unknown)", () => {
    setUmbracoVersion("not-a-version");
    expect(isAtLeast("17.4")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- --no-coverage src/umb-management-api/version/__tests__/umbraco-version.test.ts
```

Expected: FAIL — module `../umbraco-version.js` does not exist.

- [ ] **Step 3: Implement the module**

Create `src/umb-management-api/version/umbraco-version.ts`:

```typescript
/**
 * Project-local store for the Umbraco server version. Populated once at boot
 * from the existing getServerInformation() call. Read by withVersionDispatch
 * to choose pre/post-17.4 handlers without an SDK round-trip.
 */

let umbracoVersion: string | null = null;

export const setUmbracoVersion = (version: string): void => {
  umbracoVersion = version;
};

export const resetUmbracoVersion = (): void => {
  umbracoVersion = null;
};

export const getUmbracoVersion = (): string | null => umbracoVersion;

interface ParsedVersion {
  major: number;
  minor: number;
}

const parse = (raw: string): ParsedVersion | null => {
  const match = /^(\d+)\.(\d+)/.exec(raw);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]) };
};

/**
 * Returns true if the stored Umbraco version is at least `target`.
 * `target` accepts "MAJOR.MINOR" (e.g. "17.4") — patch is ignored.
 * Returns false if the stored version is null or unparseable: callers
 * treat "unknown" as "older" so we fall back to fixtures, not API calls.
 */
export const isAtLeast = (target: string): boolean => {
  if (umbracoVersion === null) return false;
  const current = parse(umbracoVersion);
  const wanted = parse(target);
  if (current === null || wanted === null) return false;
  if (current.major !== wanted.major) return current.major > wanted.major;
  return current.minor >= wanted.minor;
};
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- --no-coverage src/umb-management-api/version/__tests__/umbraco-version.test.ts
```

Expected: PASS, 9 tests.

- [ ] **Step 5: Compile check**

```bash
npm run compile
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/umb-management-api/version/umbraco-version.ts src/umb-management-api/version/__tests__/umbraco-version.test.ts
git commit -m "feat: project-local Umbraco version flag with isAtLeast helper"
```

---

### Task 2: Create the version-dispatch helper

Wraps two handlers and selects one based on the version flag.

**Files:**
- Create: `src/umb-management-api/version/version-dispatch.ts`
- Create: `src/umb-management-api/version/__tests__/version-dispatch.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/umb-management-api/version/__tests__/version-dispatch.test.ts`:

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { withVersionDispatch } from "../version-dispatch.js";
import {
  setUmbracoVersion,
  resetUmbracoVersion,
} from "../umbraco-version.js";

describe("withVersionDispatch", () => {
  beforeEach(() => {
    resetUmbracoVersion();
  });

  it("calls the pre174 handler when version is unknown (forward-default to fixture)", async () => {
    const pre174 = jest.fn(async () => "pre");
    const post174 = jest.fn(async () => "post");
    const handler = withVersionDispatch({ pre174, post174 });

    const result = await handler({ foo: "bar" });

    expect(result).toBe("pre");
    expect(pre174).toHaveBeenCalledWith({ foo: "bar" });
    expect(post174).not.toHaveBeenCalled();
  });

  it("calls the pre174 handler when version is below 17.4", async () => {
    setUmbracoVersion("17.3.5");
    const pre174 = jest.fn(async () => "pre");
    const post174 = jest.fn(async () => "post");
    const handler = withVersionDispatch({ pre174, post174 });

    const result = await handler({});

    expect(result).toBe("pre");
    expect(post174).not.toHaveBeenCalled();
  });

  it("calls the post174 handler when version is 17.4", async () => {
    setUmbracoVersion("17.4.0");
    const pre174 = jest.fn(async () => "pre");
    const post174 = jest.fn(async () => "post");
    const handler = withVersionDispatch({ pre174, post174 });

    const result = await handler({});

    expect(result).toBe("post");
    expect(pre174).not.toHaveBeenCalled();
  });

  it("calls the post174 handler when version is newer than 17.4", async () => {
    setUmbracoVersion("18.0.0");
    const pre174 = jest.fn(async () => "pre");
    const post174 = jest.fn(async () => "post");
    const handler = withVersionDispatch({ pre174, post174 });

    const result = await handler({});

    expect(result).toBe("post");
  });

  it("accepts sync handlers and awaits them", async () => {
    setUmbracoVersion("17.4.0");
    const handler = withVersionDispatch({
      pre174: () => "pre" as const,
      post174: () => "post" as const,
    });

    await expect(handler({})).resolves.toBe("post");
  });

  it("forwards arguments to whichever handler runs", async () => {
    setUmbracoVersion("17.4.0");
    const post174 = jest.fn(async (input: { id: string }) => input.id);
    const handler = withVersionDispatch({
      pre174: async () => "should not run",
      post174,
    });

    const result = await handler({ id: "abc" });

    expect(result).toBe("abc");
    expect(post174).toHaveBeenCalledWith({ id: "abc" });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- --no-coverage src/umb-management-api/version/__tests__/version-dispatch.test.ts
```

Expected: FAIL — module `../version-dispatch.js` does not exist.

- [ ] **Step 3: Implement the helper**

Create `src/umb-management-api/version/version-dispatch.ts`:

```typescript
import { isAtLeast } from "./umbraco-version.js";

/**
 * Wraps two handlers — one for pre-17.4 Umbraco, one for 17.4+ — and returns
 * a single handler that dispatches by the project-local version flag.
 *
 * Forward-default: if the version flag is unknown, calls `pre174`. Pre-17.4
 * handlers are expected to return canned fixtures (no API calls), so they're
 * safe to run before version detection has succeeded.
 */
export function withVersionDispatch<I, O>(opts: {
  pre174: (input: I) => Promise<O> | O;
  post174: (input: I) => Promise<O> | O;
}): (input: I) => Promise<O> {
  return async (input) => {
    const handler = isAtLeast("17.4") ? opts.post174 : opts.pre174;
    return handler(input);
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- --no-coverage src/umb-management-api/version/__tests__/version-dispatch.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Compile check**

```bash
npm run compile
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/umb-management-api/version/version-dispatch.ts src/umb-management-api/version/__tests__/version-dispatch.test.ts
git commit -m "feat: withVersionDispatch helper for pre/post-17.4 tool handlers"
```

---

### Task 3: Create the fixture loader

Tiny synchronous JSON loader used at tool module-load time. Accepts a path string or a `new URL(..., import.meta.url)` instance.

**Files:**
- Create: `src/umb-management-api/version/read-fixture.ts`
- Create: `src/umb-management-api/version/__tests__/read-fixture.test.ts`
- Create: `src/umb-management-api/version/__tests__/fixtures/sample.json` (test asset)

- [ ] **Step 1: Write the test asset**

Create `src/umb-management-api/version/__tests__/fixtures/sample.json`:

```json
{
  "name": "demo",
  "items": [1, 2, 3]
}
```

- [ ] **Step 2: Write the failing test**

Create `src/umb-management-api/version/__tests__/read-fixture.test.ts`:

```typescript
import { describe, it, expect } from "@jest/globals";
import { readFixture } from "../read-fixture.js";

interface Sample {
  name: string;
  items: number[];
}

describe("readFixture", () => {
  it("loads JSON from a URL relative to the importing module", () => {
    const data = readFixture<Sample>(
      new URL("./fixtures/sample.json", import.meta.url),
    );

    expect(data).toEqual({ name: "demo", items: [1, 2, 3] });
  });

  it("throws if the file is missing", () => {
    expect(() =>
      readFixture(new URL("./fixtures/does-not-exist.json", import.meta.url)),
    ).toThrow();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npm test -- --no-coverage src/umb-management-api/version/__tests__/read-fixture.test.ts
```

Expected: FAIL — module `../read-fixture.js` does not exist.

- [ ] **Step 4: Implement the loader**

Create `src/umb-management-api/version/read-fixture.ts`:

```typescript
import { readFileSync } from "node:fs";

/**
 * Loads a JSON fixture from disk and parses it. Used by pre-17.4 tool handlers
 * to return canned responses shaped to the 17.4 contract.
 *
 * Accepts a path string or a URL (typically `new URL("./tool.pre174.json",
 * import.meta.url)`). Reads synchronously at module-load time; callers should
 * hold the result in a module-scoped const so we don't hit disk per call.
 */
export const readFixture = <T>(path: string | URL): T =>
  JSON.parse(readFileSync(path, "utf8")) as T;
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm test -- --no-coverage src/umb-management-api/version/__tests__/read-fixture.test.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 6: Compile check**

```bash
npm run compile
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/umb-management-api/version/read-fixture.ts src/umb-management-api/version/__tests__/read-fixture.test.ts src/umb-management-api/version/__tests__/fixtures/
git commit -m "feat: readFixture loader for pre-17.4 JSON tool responses"
```

---

### Task 4: Wire `setUmbracoVersion` into boot

Capture the server version once during the existing boot flow at `src/index.ts:55-59` and stash it via `setUmbracoVersion`. Reuse the existing `getServerInformation()` result so we don't make a second call.

**Files:**
- Modify: `src/index.ts:54-59`

- [ ] **Step 1: Read the current boot block**

Open `src/index.ts` and locate lines 55-59:

```typescript
  // Check Umbraco version compatibility (logs result internally)
  await checkUmbracoVersion({
    mcpVersion: packageJson.version,
    client: { getServerInformation: () => client.getServerInformation() }
  });
```

- [ ] **Step 2: Replace with a single-fetch version**

Replace those five lines with:

```typescript
  // Fetch server info once, share it with the version check and the local flag
  const serverInfo = await client.getServerInformation();
  setUmbracoVersion(serverInfo.version);

  // Check Umbraco version compatibility (logs result internally)
  await checkUmbracoVersion({
    mcpVersion: packageJson.version,
    client: { getServerInformation: async () => serverInfo },
  });
```

- [ ] **Step 3: Add the import**

At the top of `src/index.ts`, near the other imports from `./umb-management-api/...`, add:

```typescript
import { setUmbracoVersion } from "./umb-management-api/version/umbraco-version.js";
```

- [ ] **Step 4: Compile check**

```bash
npm run compile
```

Expected: no errors. If TypeScript complains about the shape of the `getServerInformation` argument to `checkUmbracoVersion`, the cached value's type already matches — but if the SDK's `VersionCheckClient` insists on a specific return type, cast minimally: `async () => serverInfo as Awaited<ReturnType<typeof client.getServerInformation>>`.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: capture Umbraco version at boot into project-local flag"
```

---

### Task 5: Registry sweep test for paired tools

Walks the filesystem under `src/umb-management-api/tools/` for any `*.pre174.json` fixture, finds its sibling `.ts` tool definition, and validates the JSON against the tool's `outputSchema`. Initially the test runs but finds zero fixtures and passes vacuously; once Task 6 lands, it actually validates `get-cultures.pre174.json`.

**Files:**
- Create: `src/umb-management-api/tools/__tests__/version-paired-fixtures.test.ts`

- [ ] **Step 1: Write the test**

Create `src/umb-management-api/tools/__tests__/version-paired-fixtures.test.ts`:

```typescript
import { describe, it, expect } from "@jest/globals";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsRoot = path.resolve(__dirname, "..");

const findFixtures = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "__tests__" || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findFixtures(full));
    } else if (entry.isFile() && entry.name.endsWith(".pre174.json")) {
      out.push(full);
    }
  }
  return out;
};

const fixtures = findFixtures(toolsRoot);

describe("version-paired fixtures match their tool outputSchema", () => {
  if (fixtures.length === 0) {
    it("no paired fixtures found yet (this is expected before the pilot ships)", () => {
      expect(fixtures).toEqual([]);
    });
    return;
  }

  it.each(fixtures)("%s parses against its tool's outputSchema", async (fixturePath) => {
    const toolPath = fixturePath.replace(/\.pre174\.json$/, ".ts");
    expect(fs.existsSync(toolPath)).toBe(true);

    const mod = await import(pathToFileURL(toolPath).href);
    const tool = mod.default;
    expect(tool?.outputSchema).toBeDefined();

    // The fixture file is the full MCP tool-result envelope:
    //   { content: [{ type: "text", text: "<json>" }] }
    // outputSchema describes the inner payload — JSON.parse `content[0].text`
    // before validating.
    const envelope = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as {
      content?: Array<{ type?: string; text?: string }>;
    };
    const innerText = envelope.content?.[0]?.text;
    if (typeof innerText !== "string") {
      throw new Error(
        `Fixture ${path.basename(fixturePath)} is not a tool-result envelope (expected content[0].text to be a string)`,
      );
    }
    const payload = JSON.parse(innerText);

    const schema = tool.outputSchema instanceof z.ZodType
      ? tool.outputSchema
      : z.object(tool.outputSchema as z.ZodRawShape);

    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new Error(
        `Fixture ${path.basename(fixturePath)} payload failed schema validation:\n${
          result.error.message
        }`,
      );
    }
  });
});
```

- [ ] **Step 2: Run the test**

```bash
npm test -- --no-coverage src/umb-management-api/tools/__tests__/version-paired-fixtures.test.ts
```

Expected: PASS, 1 vacuous test ("no paired fixtures found yet").

- [ ] **Step 3: Compile check**

```bash
npm run compile
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/umb-management-api/tools/__tests__/version-paired-fixtures.test.ts
git commit -m "test: sweep test validating pre-17.4 fixtures against tool outputSchemas"
```

---

### Task 6: Pilot conversion — `get-culture`

Convert the existing `get-cultures.ts` tool to use `withVersionDispatch`. The post-17.4 handler is the current API call; the pre-17.4 handler returns a canned fixture shaped like the 17.4 response (since 17.3 has the empty-name bug, the pre-17.4 fixture is the *clean* shape we wish 17.3 had returned).

**Files:**
- Create: `src/umb-management-api/tools/culture/get-cultures.post174.ts`
- Create: `src/umb-management-api/tools/culture/get-cultures.pre174.json`
- Modify: `src/umb-management-api/tools/culture/get-cultures.ts`

- [ ] **Step 1: Read the current tool**

Open `src/umb-management-api/tools/culture/get-cultures.ts`. The current shape:
- `outputSchema` is a hand-written `z.object({ total, items: [{ name, englishName }] })` workaround for the empty-name bug.
- `handler` calls `executeGetApiCall((client) => client.getCulture(params, CAPTURE_RAW_HTTP_RESPONSE))`.

That `handler` body becomes the `post174` handler verbatim. The `outputSchema` stays exactly as it is — it's already the unified shape.

- [ ] **Step 2: Create the post-17.4 handler**

Create `src/umb-management-api/tools/culture/get-cultures.post174.ts`:

```typescript
import { GetCultureParams } from "@/umb-management-api/schemas/index.js";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
} from "@umbraco-cms/mcp-server-sdk";

export const post174 = (params: GetCultureParams) =>
  executeGetApiCall((client) =>
    client.getCulture(params, CAPTURE_RAW_HTTP_RESPONSE),
  );
```

- [ ] **Step 3: Create the pre-17.4 fixture**

Create `src/umb-management-api/tools/culture/get-cultures.pre174.json`:

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\"total\":2,\"items\":[{\"name\":\"en-US\",\"englishName\":\"English (United States)\"},{\"name\":\"da-DK\",\"englishName\":\"Danish (Denmark)\"}]}"
    }
  ]
}
```

Note: the fixture is the **MCP tool result envelope** (`{ content: [...] }`), not just the inner payload. That's what `executeGetApiCall` returns and what the tool handler hands back to MCP. The inner JSON string is the response payload Umbraco would produce.

- [ ] **Step 4: Refactor the tool definition**

Replace the contents of `src/umb-management-api/tools/culture/get-cultures.ts` with:

```typescript
import { GetCultureParams } from "@/umb-management-api/schemas/index.js";
import { getCultureQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";
import { withVersionDispatch } from "../../version/version-dispatch.js";
import { readFixture } from "../../version/read-fixture.js";
import { post174 } from "./get-cultures.post174.js";

// Unified shape — matches what 17.4 returns. Pre-17.4, Umbraco returned some
// cultures with empty `name` strings; the pre-17.4 fixture below presents the
// clean shape the chained editor MCP expects, even though the live API on
// older Umbracos wouldn't produce it. Shape stability > value fidelity.
const outputSchema = z.object({
  total: z.number(),
  items: z.array(
    z.object({
      name: z.string(),
      englishName: z.string(),
    }),
  ),
});

type ToolResult = Awaited<ReturnType<typeof post174>>;

const pre174Fixture = readFixture<ToolResult>(
  new URL("./get-cultures.pre174.json", import.meta.url),
);

const GetCulturesTool = {
  name: "get-culture",
  description:
    "Retrieves a paginated list of cultures that Umbraco can be configured to use",
  inputSchema: getCultureQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ["list"],
  handler: withVersionDispatch({
    pre174: (_params: GetCultureParams) => pre174Fixture,
    post174,
  }),
} satisfies ToolDefinition<
  typeof getCultureQueryParams.shape,
  typeof outputSchema.shape
>;

export default withStandardDecorators(GetCulturesTool);
```

- [ ] **Step 5: Run the sweep test**

```bash
npm test -- --no-coverage src/umb-management-api/tools/__tests__/version-paired-fixtures.test.ts
```

Expected: PASS, 1 test — the sweep finds `get-cultures.pre174.json`, extracts `content[0].text`, parses it, and validates against `outputSchema`.

If validation fails, the inner JSON in `text` doesn't match `{ total, items: [...] }`. Fix the fixture, not the test. The contract is: **the fixture file IS the full MCP tool-result envelope** (matches what the post-17.4 handler returns); `outputSchema` describes only the inner payload nested inside `content[0].text`.

- [ ] **Step 6: Run the existing culture tool tests**

```bash
npm test -- --no-coverage src/umb-management-api/tools/culture/__tests__/
```

Expected: PASS — the existing tests call the tool by name through its handler. With no Umbraco version set in the test environment, `isAtLeast("17.4")` returns `false`, so they exercise the **pre-17.4 fixture path**. If the existing tests assert on real Umbraco responses (they are integration tests against a live instance), they will now return the fixture instead. Read each test before assuming it'll pass.

If existing integration tests break because they expect live data and now get fixture data: that's the design working as intended for unit-style runs, but it breaks real integration testing. Fix by calling `setUmbracoVersion("17.4.0")` in the test's `beforeAll` (or in `jest.setup.ts` if applicable to all integration tests). Look at `jest.setup.ts` first to see if there's a global setup hook.

- [ ] **Step 7: Compile check**

```bash
npm run compile
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/umb-management-api/tools/culture/get-cultures.ts src/umb-management-api/tools/culture/get-cultures.post174.ts src/umb-management-api/tools/culture/get-cultures.pre174.json
git commit -m "feat: pilot get-culture as a version-paired tool (pre/post-17.4)"
```

If integration test wiring needed adjustment in Step 6, include those files in this commit (or a follow-up commit titled `test: set Umbraco version in integration setup for paired tools`).

---

### Task 7: Final verification

- [ ] **Step 1: Full unit-test pass (no integration)**

```bash
npm test -- --no-coverage \
  src/umb-management-api/version/__tests__/ \
  src/umb-management-api/tools/__tests__/version-paired-fixtures.test.ts
```

Expected: all green. 9 + 6 + 2 + 1 = 18 tests pass.

- [ ] **Step 2: Final compile**

```bash
npm run compile
```

Expected: no errors.

- [ ] **Step 3: Verify nothing was missed**

```bash
git log --oneline -7
```

You should see commits in order:
1. `feat: project-local Umbraco version flag…`
2. `feat: withVersionDispatch helper…`
3. `feat: readFixture loader…`
4. `feat: capture Umbraco version at boot…`
5. `test: sweep test validating pre-17.4 fixtures…`
6. `feat: pilot get-culture as a version-paired tool…`

- [ ] **Step 4: Report**

Summarise to the user:
- Files added (six modules + tests, one fixture).
- One pilot tool converted (`get-culture`).
- Sweep test in place; future paired tools just drop a `*.pre174.json` next to the tool and the test validates it.
- Integration tests (`npm test` against a live `umbraco:start`) and the editor MCP chained behaviour were **not** run here — flag both as user-driven follow-ups per CLAUDE.md.

---

## Self-review notes

**Spec coverage check:**

| Spec section | Plan task |
|---|---|
| Tool model (one name, one schema, dispatch) | Task 6 (pilot) |
| File layout (`.ts` + `.pre174.json` + `.post174.ts`) | Task 6 |
| `umbraco-version` module + `isAtLeast` | Task 1 |
| `withVersionDispatch` helper | Task 2 |
| `readFixture` loader | Task 3 |
| Forward-default to pre-17.4 fixture when version unknown | Task 1 (test), Task 2 (test) |
| Boot wiring with single `getServerInformation()` fetch | Task 4 |
| Registry sweep test | Task 5 |
| Pilot on `get-culture` | Task 6 |
| Editor MCP impact: zero | No code change needed; sweep test guards drift |

**Decisions worth flagging during execution:**

- **Fixture envelope vs payload.** Task 6 Step 5 acknowledges that `outputSchema` describes the inner payload, but `executeGetApiCall` returns the MCP tool-result envelope. Task 5's sweep test validates the JSON it loads — that JSON is the envelope. The sweep test must therefore extract `content[0].text`, parse it, and validate **that** against `outputSchema`. If you discover this during execution and the sweep test wasn't written to do so, update Task 5's `safeParse` call accordingly. Either approach (fixture-is-envelope vs fixture-is-payload) is workable; pick one and be consistent across the helper, the sweep test, and the pilot. The plan above is written for **fixture-is-envelope** because that's what handlers actually return.

- **Existing culture integration tests.** Task 6 Step 6 may surface that integration tests assume live Umbraco data. If so, the fix is to set `setUmbracoVersion("17.4.0")` in the test setup, not to abandon the design.
