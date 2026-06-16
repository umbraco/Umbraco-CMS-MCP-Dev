import UnpublishElementTool from "../put/unpublish-element.js";
import PublishElementTool from "../put/publish-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Unpublish";

describe("unpublish-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should unpublish a published element", async () => {
    // Arrange - create and publish element
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    await PublishElementTool.handler(
      {
        id: builder.getId(),
        data: { publishSchedules: [{ culture: null }] },
      },
      createMockRequestHandlerExtra()
    );

    // Act
    const result = await UnpublishElementTool.handler(
      {
        id: builder.getId(),
        data: { cultures: null },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });

  it("should handle unpublishing a non-existent element", async () => {
    // Act
    const result = await UnpublishElementTool.handler(
      {
        id: BLANK_UUID,
        data: { cultures: [] },
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
