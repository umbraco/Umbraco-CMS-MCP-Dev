import GetRecycleBinElementChildrenTool from "../items/get/get-recycle-bin-element-children.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_RECYCLE_BIN_ELEMENT_NAME = "_Test RecycleBin Element Children";

describe("get-recycle-bin-element-children", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    await ElementTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await ElementTestHelper.emptyRecycleBin();
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get children for an element in the recycle bin", async () => {
    // Arrange - Create element and move to recycle bin
    const builder = await new ElementBuilder()
      .withName(TEST_RECYCLE_BIN_ELEMENT_NAME)
      .create();
    await builder.moveToRecycleBin();

    // Find element in recycle bin to get its ID
    const recycleBinItem = await ElementTestHelper.findElementInRecycleBin(
      TEST_RECYCLE_BIN_ELEMENT_NAME
    );
    expect(recycleBinItem).toBeDefined();

    // Act - Get children of the recycle bin item (will be empty for flat elements)
    const result = await GetRecycleBinElementChildrenTool.handler(
      {
        parentId: recycleBinItem!.id,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent parent in recycle bin", async () => {
    // Act
    const result = await GetRecycleBinElementChildrenTool.handler(
      {
        parentId: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
