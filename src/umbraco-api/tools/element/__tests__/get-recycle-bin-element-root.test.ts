import GetRecycleBinElementRootTool from "../items/get/get-recycle-bin-element-root.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_RECYCLE_BIN_NAME = "_Test RecycleBin Element Root";

describe("get-recycle-bin-element-root", () => {
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

  it("should get recycle bin root items", async () => {
    // Arrange - Create element and move to recycle bin
    const builder = await new ElementBuilder()
      .withName(TEST_RECYCLE_BIN_NAME)
      .create();
    await builder.moveToRecycleBin();

    // Act
    const result = await GetRecycleBinElementRootTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should return empty recycle bin when nothing deleted", async () => {
    // Act
    const result = await GetRecycleBinElementRootTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - recycle bin is empty after beforeEach
    expect(result.isError).toBeFalsy();
  });
});
