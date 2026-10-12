import { runWithRequestContext, UMBRACO_VERSION_CONTEXT_KEY } from "@umbraco-cms/mcp-server-sdk";
import { isUmbracoAtLeast, setUmbracoVersion } from "../umbraco-api/runtime-context.js";

// Regression test for #538: on hosted, one isolate serves sites on different
// 17.x minors, so version gates must use the version of the request they run
// in, not a process-wide value. Precedence is the version passed in
// (registration time), then the active request's version (handler time), then
// the stdio start-up version. With none of them, gates take the legacy branch.
describe("isUmbracoAtLeast version precedence (#538)", () => {
  afterEach(() => setUmbracoVersion(null));

  it("takes the legacy branch when no version is known", () => {
    expect(isUmbracoAtLeast(17, 6)).toBe(false);
  });

  it("falls back to the stdio start-up version", () => {
    setUmbracoVersion("17.6.0");
    expect(isUmbracoAtLeast(17, 6)).toBe(true);
  });

  it("uses the active request's version over the start-up version", () => {
    setUmbracoVersion("17.6.0");
    runWithRequestContext({ [UMBRACO_VERSION_CONTEXT_KEY]: "17.5.3" }, () => {
      expect(isUmbracoAtLeast(17, 6)).toBe(false);
    });
    runWithRequestContext({ [UMBRACO_VERSION_CONTEXT_KEY]: "17.6.0" }, () => {
      expect(isUmbracoAtLeast(17, 6)).toBe(true);
    });
  });

  it("uses a passed-in version over everything else", () => {
    setUmbracoVersion("17.6.0");
    runWithRequestContext({ [UMBRACO_VERSION_CONTEXT_KEY]: "17.6.0" }, () => {
      expect(isUmbracoAtLeast(17, 6, "17.5.3")).toBe(false);
    });
    expect(isUmbracoAtLeast(17, 6, "17.6.1")).toBe(true);
  });
});
