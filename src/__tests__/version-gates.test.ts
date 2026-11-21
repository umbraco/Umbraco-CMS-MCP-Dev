import { runWithRequestContext, UMBRACO_VERSION_CONTEXT_KEY } from "@umbraco-cms/mcp-server-sdk";
import { sections } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/currentUserResponseModel.js";
import { isUmbracoAtLeast, setUmbracoVersion } from "../umbraco-api/runtime-context.js";
import { DocumentCollection } from "../umbraco-api/tools/document/index.js";
import { ElementCollection } from "../umbraco-api/tools/element/index.js";
import { MediaCollection } from "../umbraco-api/tools/media/index.js";
import { UserCollection } from "../umbraco-api/tools/user/index.js";

// jest.setup.ts primes the start-up version; restore it after each test.
const JEST_DEFAULT_VERSION = process.env.MCP_TEST_UMBRACO_VERSION ?? "18.1.0";

// On hosted, one isolate serves sites on different 18.x minors, so version
// gates must use the version of the request they run in, not a process-wide
// value. Precedence is the version passed in (registration time), then the
// active request's version (handler time), then the stdio start-up version.
// With none of them, gates take the legacy branch.
describe("isUmbracoAtLeast version precedence", () => {
  afterEach(() => setUmbracoVersion(JEST_DEFAULT_VERSION));

  it("takes the legacy branch when no version is known", () => {
    setUmbracoVersion(null);
    expect(isUmbracoAtLeast(18, 1)).toBe(false);
  });

  it("falls back to the stdio start-up version", () => {
    setUmbracoVersion("18.1.0");
    expect(isUmbracoAtLeast(18, 1)).toBe(true);
  });

  it("uses the active request's version over the start-up version", () => {
    setUmbracoVersion("18.1.0");
    runWithRequestContext({ [UMBRACO_VERSION_CONTEXT_KEY]: "18.0.2" }, () => {
      expect(isUmbracoAtLeast(18, 1)).toBe(false);
    });
    runWithRequestContext({ [UMBRACO_VERSION_CONTEXT_KEY]: "18.1.0" }, () => {
      expect(isUmbracoAtLeast(18, 1)).toBe(true);
    });
  });

  it("uses a passed-in version over everything else", () => {
    setUmbracoVersion("18.1.0");
    runWithRequestContext({ [UMBRACO_VERSION_CONTEXT_KEY]: "18.1.0" }, () => {
      expect(isUmbracoAtLeast(18, 1, "18.0.2")).toBe(false);
    });
    expect(isUmbracoAtLeast(18, 1, "18.1.1")).toBe(true);
  });
});

// Tools whose endpoints were added to the Management API in Umbraco 18.1.
// They must not be listed on an 18.0.x site, where every call would 404.
describe("Umbraco 18.1 tool gates", () => {
  const user = {
    allowedSections: Object.values(sections),
  } as Partial<CurrentUserResponseModel> as CurrentUserResponseModel;

  const gated = [
    { collection: DocumentCollection, tools: ["create-and-publish-document", "update-and-publish-document", "sort-document-children", "sort-document-root-children"] },
    { collection: MediaCollection, tools: ["sort-media-children", "sort-media-root-children"] },
    { collection: ElementCollection, tools: ["get-element-published", "create-and-publish-element", "update-and-publish-element"] },
    { collection: UserCollection, tools: ["get-user-batch"] },
  ];

  const names = (collection: (typeof gated)[number]["collection"], umbracoVersion?: string) =>
    collection.tools(user, { umbracoVersion }).map((t) => t.name);

  afterEach(() => setUmbracoVersion(JEST_DEFAULT_VERSION));

  it.each(gated)("$collection.metadata.name: lists the 18.1 tools on 18.1+", ({ collection, tools }) => {
    for (const version of ["18.1.0", "18.3.2", "19.0.0"]) {
      expect(names(collection, version)).toEqual(expect.arrayContaining(tools));
    }
  });

  it.each(gated)("$collection.metadata.name: omits the 18.1 tools on 18.0.x", ({ collection, tools }) => {
    const listed = names(collection, "18.0.2");
    for (const tool of tools) {
      expect(listed).not.toContain(tool);
    }
  });

  it.each(gated)("$collection.metadata.name: omits the 18.1 tools when the version is unknown", ({ collection, tools }) => {
    setUmbracoVersion(null);
    const listed = names(collection);
    for (const tool of tools) {
      expect(listed).not.toContain(tool);
    }
  });
});
