import GetElementAncestorsTool from "../items/get/get-element-ancestors.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test GetElementAncestors";

describe("get-element-ancestors", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get ancestors for an element", async () => {
    // Arrange - Create an element (root elements have no ancestors, returns empty items)
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act
    const result = await GetElementAncestorsTool.handler(
      { descendantId: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should return empty items for non-existent descendant", async () => {
    // Act
    const result = await GetElementAncestorsTool.handler(
      { descendantId: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert - API returns empty list for non-existent ID
    expect(result).toMatchSnapshot();
  });
});
