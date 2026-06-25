import DeleteElementFromRecycleBinTool from "../delete/delete-element-from-recycle-bin.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Recycle Bin Delete";

describe("delete-element-from-recycle-bin", () => {
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

  it("should permanently delete an element from the recycle bin", async () => {
    // Arrange - create element and move to recycle bin
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    await builder.moveToRecycleBin();

    const elementInBin = await ElementTestHelper.findElementInRecycleBin(TEST_ELEMENT_NAME);
    expect(elementInBin).toBeDefined();

    // Act
    const result = await DeleteElementFromRecycleBinTool.handler(
      { id: elementInBin!.id },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();

    // Verify element is no longer in recycle bin
    const deletedElement = await ElementTestHelper.findElementInRecycleBin(TEST_ELEMENT_NAME);
    expect(deletedElement).toBeUndefined();
  });

  it("should handle non-existent element in recycle bin", async () => {
    // Act
    const result = await DeleteElementFromRecycleBinTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
