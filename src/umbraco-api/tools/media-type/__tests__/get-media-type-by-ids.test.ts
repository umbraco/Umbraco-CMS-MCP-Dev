import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import GetMediaTypeByIdsTool from "../get/get-media-type-by-ids.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-type-by-ids", () => {
  setupTestEnvironment();

  const TEST_MEDIA_TYPE_NAME_1 = "_Test Media Type 1";
  const TEST_MEDIA_TYPE_NAME_2 = "_Test Media Type 2";

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME_1);
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME_2);
  });

  it("should get media types by ids", async () => {
    // Create two media types
    const builder1 = await new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME_1)
      .withDescription("Test media type 1 description")
      .withAllowedAsRoot(true)
      .create();

    const builder2 = await new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME_2)
      .withDescription("Test media type 2 description")
      .withAllowedAsRoot(true)
      .create();

    const result = await GetMediaTypeByIdsTool.handler(
      {
        ids: [builder1.getId(), builder2.getId()],
      },
      createMockRequestHandlerExtra()
    );

    // Normalize and verify response
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent media types", async () => {
    const result = await GetMediaTypeByIdsTool.handler(
      {
        ids: [BLANK_UUID],
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
