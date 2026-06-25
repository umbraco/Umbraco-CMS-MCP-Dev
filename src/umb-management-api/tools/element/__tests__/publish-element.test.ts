import PublishElementTool from "../put/publish-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Publish";

describe("publish-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should publish a valid element", async () => {
    // Arrange
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act
    const result = await PublishElementTool.handler(
      {
        id: builder.getId(),
        data: { publishSchedules: [{ culture: null }] },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should handle publishing a non-existent element", async () => {
    // Act
    const result = await PublishElementTool.handler(
      {
        id: BLANK_UUID,
        data: { publishSchedules: [] },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
