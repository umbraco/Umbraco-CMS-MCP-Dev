import GetElementItemAncestorsTool from "../items/get/get-element-item-ancestors.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test GetElementItemAncestors";

describe("get-element-item-ancestors", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get ancestor chain for element ids", async () => {
    // Arrange - Create an element
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act - Get item ancestors for the created element
    const result = await GetElementItemAncestorsTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetElementItemAncestorsTool, result);
    expect(data.items).toHaveLength(1);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return empty items for non-existent ids", async () => {
    // Act
    const result = await GetElementItemAncestorsTool.handler(
      { id: [BLANK_UUID] },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
