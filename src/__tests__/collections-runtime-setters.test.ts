import { sections } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/currentUserResponseModel.js";
import { setUmbracoVersion, setAllowFilePathUploads } from "../collections.js";
import { getUmbracoVersion, isUmbracoAtLeast } from "../umbraco-api/runtime-context.js";
import { MediaCollection } from "../umbraco-api/tools/media/index.js";

// Regression test for #563: in-process consumers that import
// "@umbraco-cms/mcp-dev/collections" instead of spawning the stdio process
// (e.g. Forms in-process chaining, or a host combining several products'
// collections in one process) need to reproduce the runtime setup
// src/index.ts does at startup — setUmbracoVersion(serverInfo.version) and
// setAllowFilePathUploads(true) — but neither function was reachable from
// "./collections" before this change.
//
// Both setters live in src/umbraco-api/runtime-context.ts and mutate
// module-level state there. "../collections.js" re-exports the very same
// functions (not copies), so calling the ones imported here is
// indistinguishable from calling the stdio entry point's own calls — these
// tests assert on that shared state via runtime-context's own getters
// (getUmbracoVersion/isUmbracoAtLeast) and via a real collection.tools(user)
// gate (media's filePath upload source), rather than re-testing
// runtime-context.ts's internals in isolation.
describe("./collections exports the runtime setters src/index.ts uses at startup (#563)", () => {
  // jest.setup.ts primes the shared runtime-context singleton with
  // '18.0.0' and setAllowFilePathUploads defaults to false; restore both
  // after each test so this file doesn't leak state into others.
  afterEach(() => {
    setUmbracoVersion("18.0.0");
    setAllowFilePathUploads(false);
  });

  it("wires setUmbracoVersion from ./collections to the shared runtime-context version state", () => {
    setUmbracoVersion("17.6.10");

    expect(getUmbracoVersion()).toBe("17.6.10");
    expect(isUmbracoAtLeast(17, 6)).toBe(true);
    expect(isUmbracoAtLeast(17, 7)).toBe(false);
  });

  it("wires setAllowFilePathUploads from ./collections to media's filePath source-type gate in collection.tools(user)", () => {
    const userMock = {
      allowedSections: [sections.media],
    } as Partial<CurrentUserResponseModel> as CurrentUserResponseModel;

    setAllowFilePathUploads(false);
    const createMediaWithout = MediaCollection.tools(userMock).find((t) => t.name === "create-media");
    expect(createMediaWithout).toBeDefined();
    expect((createMediaWithout!.inputSchema as any).sourceType.options).not.toContain("filePath");

    setAllowFilePathUploads(true);
    const createMediaWith = MediaCollection.tools(userMock).find((t) => t.name === "create-media");
    expect(createMediaWith).toBeDefined();
    expect((createMediaWith!.inputSchema as any).sourceType.options).toContain("filePath");
  });
});
