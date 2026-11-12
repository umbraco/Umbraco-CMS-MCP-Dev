import SearchElementTool from "../get/search-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test SearchElement";

describe("search-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should search for elements by query", async () => {
    // Arrange - Create an element with a unique name
    await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act - Search by the unique name prefix. Since Umbraco 19 item search is served
    // from the (asynchronously updated) search index, so poll until the element is indexed.
    let result = await SearchElementTool.handler(
      { trashed: undefined, culture: undefined, parentId: undefined, allowedElementTypes: undefined, query: "_Test SearchElement" },
      createMockRequestHandlerExtra()
    );
    for (let attempt = 0; attempt < 20 && !result.isError && ((result.structuredContent as any)?.total ?? 0) === 0; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      result = await SearchElementTool.handler(
        { trashed: undefined, culture: undefined, parentId: undefined, allowedElementTypes: undefined, query: "_Test SearchElement" },
        createMockRequestHandlerExtra()
      );
    }

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should return empty results for non-matching query", async () => {
    // Act - Search for something that won't match
    const result = await SearchElementTool.handler(
      { trashed: undefined, culture: undefined, parentId: undefined, allowedElementTypes: undefined, query: "_NonExistentElementXYZ12345" },
      createMockRequestHandlerExtra()
    );

    // Assert - Should succeed with empty results
    expect(result.isError).toBeFalsy();
  });
});
