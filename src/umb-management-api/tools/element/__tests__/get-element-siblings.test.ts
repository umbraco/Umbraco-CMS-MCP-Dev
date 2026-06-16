import GetElementSiblingsTool from "../items/get/get-element-siblings.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SIBLING_1_NAME = "_Test GetElementSiblings 1";
const TEST_SIBLING_2_NAME = "_Test GetElementSiblings 2";

describe("get-element-siblings", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await ElementTestHelper.cleanup(TEST_SIBLING_2_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get sibling elements", async () => {
    // Arrange - Create two elements at root level (root elements are siblings of each other)
    const sibling1 = await new ElementBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .create();

    await new ElementBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .create();

    // Act - Get siblings of the first element
    const result = await GetElementSiblingsTool.handler(
      {
        target: sibling1.getId(),
        before: undefined,
        after: 100,
        foldersOnly: false,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent target", async () => {
    // Act
    const result = await GetElementSiblingsTool.handler(
      {
        target: BLANK_UUID,
        before: undefined,
        after: 100,
        foldersOnly: false,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
