import GetRecycleBinElementOriginalParentTool from "../get/get-recycle-bin-element-original-parent.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Original Parent";

describe("get-recycle-bin-element-original-parent", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await ElementTestHelper.emptyRecycleBin();
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get the original parent of a recycled element", async () => {
    // Arrange - create element and move to recycle bin
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    await builder.moveToRecycleBin();

    const recycleBinElement = await ElementTestHelper.findElementInRecycleBin(TEST_ELEMENT_NAME);
    expect(recycleBinElement).toBeDefined();

    // Act
    const result = await GetRecycleBinElementOriginalParentTool.handler(
      { id: recycleBinElement!.id },
      createMockRequestHandlerExtra()
    );

    // Assert - might be null if no original parent (root-level element)
    const data = result.structuredContent;
    if (data === null || data === undefined) {
      expect(result).toMatchSnapshot();
    } else {
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
    }
  });

  it("should handle non-existent recycled element", async () => {
    // Act
    const result = await GetRecycleBinElementOriginalParentTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
