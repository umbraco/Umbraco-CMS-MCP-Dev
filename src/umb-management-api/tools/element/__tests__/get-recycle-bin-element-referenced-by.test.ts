import GetRecycleBinElementReferencedByTool from "../get/get-recycle-bin-element-referenced-by.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element for Recycle Bin Referenced By";

describe("get-recycle-bin-element-referenced-by", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await ElementTestHelper.emptyRecycleBin();
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should list content referencing recycled elements", async () => {
    // Arrange - create element and move it to recycle bin
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    await builder.moveToRecycleBin();

    // Act - get references for all recycled elements (not scoped to a specific ID)
    const result = await GetRecycleBinElementReferencedByTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - might be empty list if no references exist, snapshot both cases
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle empty recycle bin gracefully", async () => {
    // Act - call with no elements in recycle bin
    const result = await GetRecycleBinElementReferencedByTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - empty list is a valid response, not an error
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
