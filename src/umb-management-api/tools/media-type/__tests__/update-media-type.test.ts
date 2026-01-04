import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import UpdateMediaTypeTool from "../put/update-media-type.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("update-media-type", () => {
  setupTestEnvironment();

  const TEST_MEDIA_TYPE_NAME = "_Test Media Type";
  const UPDATED_DESCRIPTION = "Updated test media type description";

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME);
  });

  it("should update a media type", async () => {
    // Create a media type first
    const builder = await new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME)
      .withDescription("Test media type description")
      .withAllowedAsRoot(true)
      .create();

    // Update the media type
    const updateBuilder = new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME)
      .withDescription(UPDATED_DESCRIPTION)
      .withAllowedAsRoot(true);

    const result = await UpdateMediaTypeTool.handler(
      {
        id: builder.getId(),
        data: updateBuilder.build(),
      },
      createMockRequestHandlerExtra()
    );

    // Normalize and verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();

    // Verify the media type was updated
    const items = await MediaTypeTestHelper.findMediaTypes(
      TEST_MEDIA_TYPE_NAME
    );
    expect(items.length).toBe(1);
    expect(items[0].name).toBe(TEST_MEDIA_TYPE_NAME);
  });

  it("should handle non-existent media type", async () => {
    const updateBuilder = new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME)
      .withDescription(UPDATED_DESCRIPTION)
      .withAllowedAsRoot(true);

    const result = await UpdateMediaTypeTool.handler(
      {
        id: BLANK_UUID,
        data: updateBuilder.build(),
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
