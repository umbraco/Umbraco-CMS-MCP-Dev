import GetRecycleBinElementSiblingsTool from "../items/get/get-recycle-bin-element-siblings.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SIBLING_1_NAME = "_Test RecycleBin ElementSiblings 1";
const TEST_SIBLING_2_NAME = "_Test RecycleBin ElementSiblings 2";

describe("get-recycle-bin-element-siblings", () => {
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

  it("should get sibling elements in recycle bin", async () => {
    // Arrange - Create two elements and move them to recycle bin
    const sibling1 = await new ElementBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .create();

    const sibling2 = await new ElementBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .create();

    await sibling2.moveToRecycleBin();
    await sibling1.moveToRecycleBin();

    // Find sibling1 in recycle bin
    const sibling1InBin = await ElementTestHelper.findElementInRecycleBin(
      TEST_SIBLING_1_NAME
    );
    expect(sibling1InBin).toBeDefined();

    // Act - Get siblings of first element in recycle bin
    const result = await GetRecycleBinElementSiblingsTool.handler(
      {
        target: sibling1InBin!.id,
        before: undefined,
        after: 100,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent target in recycle bin", async () => {
    // Act
    const result = await GetRecycleBinElementSiblingsTool.handler(
      {
        target: BLANK_UUID,
        before: undefined,
        after: 100,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
