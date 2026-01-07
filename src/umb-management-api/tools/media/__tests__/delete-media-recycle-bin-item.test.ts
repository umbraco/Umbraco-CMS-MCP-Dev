import DeleteMediaRecycleBinItemTool from "../delete/delete-recycle-bin-item.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEDIA_NAME = "_Test Media Delete Recycle Bin";

describe("delete-media-recycle-bin-item", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any remaining test media
    await MediaTestHelper.restoreFromRecycleBin(TEST_MEDIA_NAME);
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
  });

  it("should permanently delete a media item from recycle bin", async () => {
    // Arrange: Create a media item and move it to recycle bin
    const tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    // Move to recycle bin
    await builder.moveToRecycleBin();

    // Find the media in recycle bin to get its ID
    const mediaInRecycleBin = await MediaTestHelper.findMediaInRecycleBin(TEST_MEDIA_NAME);

    // Act: Permanently delete the media from recycle bin
    const result = await DeleteMediaRecycleBinItemTool.handler(
      {
        id: mediaInRecycleBin!.id,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify the handler response using snapshot
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();

    // Verify the media no longer exists in recycle bin
    const found = await MediaTestHelper.findMediaInRecycleBin(TEST_MEDIA_NAME);
    expect(found).toBeUndefined();
  });

  it("should handle non-existent media in recycle bin", async () => {
    // Act: Try to delete non-existent media from recycle bin
    const result = await DeleteMediaRecycleBinItemTool.handler(
      {
        id: BLANK_UUID,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify the error response using snapshot
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
