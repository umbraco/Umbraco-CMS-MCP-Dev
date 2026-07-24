import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import DeleteMediaTypeTool from "../delete/delete-media-type.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("delete-media-type", () => {
  setupTestEnvironment();

  const TEST_MEDIA_TYPE_NAME = "_Test Media Type";

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME);
  });

  it("should delete a media type", async () => {
    // Create a media type first
    const builder = await new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME)
      .withDescription("Test media type description")
      .withAllowedAsRoot(true)
      .create();

    const result = await DeleteMediaTypeTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );

    // Normalize and verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();

    // Verify the media type was deleted
    const items = await MediaTypeTestHelper.findMediaTypes(
      TEST_MEDIA_TYPE_NAME
    );
    expect(items.length).toBe(0);
  });

  it("should handle non-existent media type", async () => {
    const result = await DeleteMediaTypeTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
