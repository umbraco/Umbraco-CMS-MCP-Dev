import GetItemElementTool from "../get/get-item-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_1_NAME = "_Test GetItemElement 1";
const TEST_ELEMENT_2_NAME = "_Test GetItemElement 2";

describe("get-item-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_1_NAME);
    await ElementTestHelper.cleanup(TEST_ELEMENT_2_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get element items by ids", async () => {
    // Arrange - Create two elements
    const builder1 = await new ElementBuilder()
      .withName(TEST_ELEMENT_1_NAME)
      .create();

    const builder2 = await new ElementBuilder()
      .withName(TEST_ELEMENT_2_NAME)
      .create();

    // Act - Get elements by their IDs
    const result = await GetItemElementTool.handler(
      { id: [builder1.getId(), builder2.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent element ids", async () => {
    // Act
    const result = await GetItemElementTool.handler(
      { id: [BLANK_UUID] },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
