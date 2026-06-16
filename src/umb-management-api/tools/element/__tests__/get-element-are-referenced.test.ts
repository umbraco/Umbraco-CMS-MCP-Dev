import GetElementAreReferencedTool from "../get/get-element-are-referenced.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Reference";

describe("get-element-are-referenced", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should check if elements are referenced", async () => {
    // Arrange
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act
    const result = await GetElementAreReferencedTool.handler(
      { id: [builder.getId()] } as any,
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return empty result for non-referenced element id", async () => {
    // Act
    const result = await GetElementAreReferencedTool.handler(
      { id: ["00000000-0000-0000-0000-000000000000"] } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - non-existent IDs return empty list, not an error
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
