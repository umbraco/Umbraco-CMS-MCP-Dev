import GetElementChildrenTool from "../items/get/get-element-children.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test GetElementChildren";

describe("get-element-children", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get children for a known element", async () => {
    // Arrange - Create an element (elements are flat, so children will be empty)
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act
    const result = await GetElementChildrenTool.handler(
      {
        parentId: builder.getId(),
        foldersOnly: undefined,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - returns a valid (possibly empty) list
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should return empty items for non-existent parent", async () => {
    // Act
    const result = await GetElementChildrenTool.handler(
      {
        parentId: BLANK_UUID,
        foldersOnly: undefined,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - API returns an empty list, not an error
    expect(result).toMatchSnapshot();
  });
});
