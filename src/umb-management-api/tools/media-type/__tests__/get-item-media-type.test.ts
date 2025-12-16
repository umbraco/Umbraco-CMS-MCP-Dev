import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import GetItemMediaTypeTool from "../get/get-item-media-type.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("get-item-media-type", () => {
  const TEST_MEDIA_TYPE_NAME_1 = "_Test Media Type Item 1";
  const TEST_MEDIA_TYPE_NAME_2 = "_Test Media Type Item 2";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME_1);
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME_2);
    console.error = originalConsoleError;
  });

  it("should get media type items by ids", async () => {
    // Arrange: Create two media types
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

    // Act: Get items by their IDs
    const result = await GetItemMediaTypeTool.handler(
      {
        id: [builder1.getId(), builder2.getId()],
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent media type", async () => {
    // Arrange: Use a non-existent ID
    const nonExistentId = BLANK_UUID;

    // Act: Try to get item for non-existent media type
    const result = await GetItemMediaTypeTool.handler(
      {
        id: [nonExistentId],
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify error response
    expect(result).toMatchSnapshot();
  });
});
