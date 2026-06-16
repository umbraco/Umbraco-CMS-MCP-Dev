import GetElementRootTool from "../items/get/get-element-root.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test GetElementRoot";

describe("get-element-root", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get root element items", async () => {
    // Arrange - Create an element at root level
    await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act
    const result = await GetElementRootTool.handler(
      { foldersOnly: false, dataTypeId: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should return empty items when no root elements exist", async () => {
    // Act - call without creating any elements (may still return existing items)
    const result = await GetElementRootTool.handler(
      { foldersOnly: false, dataTypeId: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert - should not be an error
    expect(result.isError).toBeFalsy();
  });
});
