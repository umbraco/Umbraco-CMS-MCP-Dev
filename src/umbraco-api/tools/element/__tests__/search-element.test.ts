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

    // Act - Search by the unique name prefix
    const result = await SearchElementTool.handler(
      { query: "_Test SearchElement" },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should return empty results for non-matching query", async () => {
    // Act - Search for something that won't match
    const result = await SearchElementTool.handler(
      { query: "_NonExistentElementXYZ12345" },
      createMockRequestHandlerExtra()
    );

    // Assert - Should succeed with empty results
    expect(result.isError).toBeFalsy();
  });
});
