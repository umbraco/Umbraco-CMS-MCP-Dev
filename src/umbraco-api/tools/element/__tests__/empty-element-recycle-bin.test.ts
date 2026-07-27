import EmptyElementRecycleBinTool from "../delete/empty-element-recycle-bin.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Empty Element RecycleBin";

describe("empty-element-recycle-bin", () => {
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

  it("should empty the element recycle bin", async () => {
    // Arrange - create element and move to recycle bin
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();
    await builder.moveToRecycleBin();

    // Verify it is in the recycle bin
    let found = await ElementTestHelper.findElementInRecycleBin(TEST_ELEMENT_NAME);
    expect(found).toBeDefined();

    // Act
    const result = await EmptyElementRecycleBinTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();

    // Verify recycle bin is now empty
    found = await ElementTestHelper.findElementInRecycleBin(TEST_ELEMENT_NAME);
    expect(found).toBeUndefined();
  });

  it("should handle emptying an already empty recycle bin", async () => {
    // Act
    const result = await EmptyElementRecycleBinTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
