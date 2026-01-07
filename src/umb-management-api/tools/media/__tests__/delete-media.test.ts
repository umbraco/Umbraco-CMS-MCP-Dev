import DeleteMediaTool from "../delete/delete-media.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEDIA_NAME = "_Test Media Delete";

describe("delete-media", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();
  });

  afterEach(async () => {
    // Clean up any remaining test media
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
  });

  it("should delete a media item", async () => {
    // Create a media item to delete
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    // Delete the media
    const result = await DeleteMediaTool.handler(
      {
        id: builder.getId(),
      } as any,
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();

    // Verify the media no longer exists
    const found = await MediaTestHelper.findMedia(TEST_MEDIA_NAME);
    expect(found).toBeUndefined();
  });

  it("should handle non-existent media", async () => {
    const result = await DeleteMediaTool.handler(
      {
        id: BLANK_UUID,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
