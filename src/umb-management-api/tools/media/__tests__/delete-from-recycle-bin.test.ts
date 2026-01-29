import DeleteFromRecycleBinTool from "../delete/delete-from-recycle-bin.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIA_NAME = "_Test Media Delete Recycle";

describe("delete-media-from-recycle-bin", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();
  });

  afterEach(async () => {
    // Clean up any test media
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
  });

  it("should delete a media item from recycle bin", async () => {
    // Create a media item and move it to recycle bin
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    await builder.moveToRecycleBin();

    // Delete from recycle bin
    const result = await DeleteFromRecycleBinTool.handler(
      {
        id: builder.getId(),
      } as any,
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();

    // Verify the media is no longer in recycle bin
    const found = await MediaTestHelper.findMedia(TEST_MEDIA_NAME);
    expect(found).toBeUndefined();
  });

  it("should handle non-existent media", async () => {
    const result = await DeleteFromRecycleBinTool.handler(
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
