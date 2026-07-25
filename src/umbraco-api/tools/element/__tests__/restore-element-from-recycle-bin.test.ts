import RestoreElementFromRecycleBinTool from "../put/restore-element-from-recycle-bin.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Restore";

describe("restore-element-from-recycle-bin", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    await ElementTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should restore an element from the recycle bin", async () => {
    // Arrange - create and move to recycle bin
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    await builder.moveToRecycleBin();

    // Act
    const result = await RestoreElementFromRecycleBinTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();

    // Verify element is back in normal tree
    const found = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(found).toBeDefined();
  });

  it("should handle non-existent element", async () => {
    // Act
    const result = await RestoreElementFromRecycleBinTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
