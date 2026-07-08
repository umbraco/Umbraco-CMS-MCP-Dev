import GetMediaTypeBatchTool from "../get/get-media-type-batch.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-type-batch", () => {
  const TEST_MEDIATYPE_NAME = "_Test Batch MediaType";
  const TEST_MEDIATYPE_NAME_2 = "_Test Batch MediaType2";
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIATYPE_NAME);
    await MediaTypeTestHelper.cleanup(TEST_MEDIATYPE_NAME_2);
  });

  it("should get a single media type with full configuration", async () => {
    // Arrange
    const builder = await new MediaTypeBuilder()
      .withName(TEST_MEDIATYPE_NAME)
      .create();

    // Act
    const result = await GetMediaTypeBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetMediaTypeBatchTool, result);
    expect(data.total).toBe(1);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].name).toBe(TEST_MEDIATYPE_NAME);
    // Distinguishing fields vs the lightweight items endpoint:
    expect(data.items[0].properties).toBeDefined();
    expect(data.items[0].allowedMediaTypes).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get multiple media types in a single request", async () => {
    // Arrange
    const builder1 = await new MediaTypeBuilder()
      .withName(TEST_MEDIATYPE_NAME)
      .create();
    const builder2 = await new MediaTypeBuilder()
      .withName(TEST_MEDIATYPE_NAME_2)
      .create();

    // Act
    const result = await GetMediaTypeBatchTool.handler(
      { id: [builder1.getId(), builder2.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetMediaTypeBatchTool, result);
    expect(data.total).toBe(2);
    expect(data.items).toHaveLength(2);
    const names = data.items.map((i: any) => i.name).sort();
    expect(names).toEqual([TEST_MEDIATYPE_NAME, TEST_MEDIATYPE_NAME_2].sort());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
