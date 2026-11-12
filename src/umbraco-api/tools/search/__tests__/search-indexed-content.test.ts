import SearchIndexedContentTool from "../post/search-indexed-content.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateErrorResult,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

// Seeded by the Clean starter kit in the demo site.
const SEEDED_DOCUMENT_NAME = "About";

describe("search-indexed-content", () => {
  setupTestEnvironment();

  it("should find seeded content in the content index", async () => {
    const result = await SearchIndexedContentTool.handler(
      { indexAlias: "Umb_Content", query: SEEDED_DOCUMENT_NAME, culture: undefined, segment: undefined },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(SearchIndexedContentTool, result) as {
      total: number;
      items: { name?: string | null; objectType: string }[];
    };
    const match = data.items.find((d) => d.name === SEEDED_DOCUMENT_NAME);
    expect(match).toBeDefined();
    expect(match!.objectType).toBe("Document");
  });

  it("should return total alongside items for cursor pagination", async () => {
    const result = await SearchIndexedContentTool.handler(
      { indexAlias: "Umb_Content", query: "the", culture: undefined, segment: undefined },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(SearchIndexedContentTool, result) as {
      total: number;
      items: unknown[];
    };
    expect(data.total).toBeGreaterThanOrEqual(data.items.length);
    expect(data.items.length).toBeGreaterThan(0);
  });

  it("should handle a non-existent index alias", async () => {
    const result = await SearchIndexedContentTool.handler(
      { indexAlias: "_NonExistentIndex", query: "x", culture: undefined, segment: undefined },
      createMockRequestHandlerExtra()
    );

    validateErrorResult(result);
    expect(result).toMatchSnapshot();
  });
});
