import MoveElementToRecycleBinTool from "../put/move-element-to-recycle-bin.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element RecycleBin";

describe("move-element-to-recycle-bin", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.emptyRecycleBin();
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should move an element to the recycle bin", async () => {
    // Arrange
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act
    const result = await MoveElementToRecycleBinTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();

    // Verify not in normal tree
    const foundNormal = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(foundNormal).toBeUndefined();

    // Verify in recycle bin
    const foundRecycleBin = await ElementTestHelper.findElementInRecycleBin(TEST_ELEMENT_NAME);
    expect(foundRecycleBin).toBeDefined();
  });

  it("should handle moving a non-existent element", async () => {
    // Act
    const result = await MoveElementToRecycleBinTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
