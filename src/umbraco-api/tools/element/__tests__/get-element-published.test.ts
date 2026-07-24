import GetElementPublishedTool from "../get/get-element-published.js";
import PublishElementTool from "../put/publish-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test GetElementPublished";

describe("get-element-published", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should return an error for an element that has not been published yet", async () => {
    // Arrange: create a draft-only element.
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Act
    const result = await GetElementPublishedTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert: no published version exists yet
    expect(result.isError).toBe(true);
  });

  it("should get the published version of an element after publishing", async () => {
    // Arrange: create and publish an element.
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const publishResult = await PublishElementTool.handler(
      {
        id: builder.getId(),
        data: { publishSchedules: [{ culture: null }] },
      },
      createMockRequestHandlerExtra()
    );
    expect(publishResult.isError).toBeFalsy();

    // Act
    const result = await GetElementPublishedTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert
    const published = validateToolResponse(GetElementPublishedTool, result);
    expect(published.id).toBe(builder.getId());
    expect(published.variants[0].name).toBe(TEST_ELEMENT_NAME);
    expect(published.variants[0].state).toBe("Published");
  });

  it("should return error for non-existent ID", async () => {
    const result = await GetElementPublishedTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
  });
});
