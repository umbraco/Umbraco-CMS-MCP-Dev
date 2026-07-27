import CopyMediaTypeTool from "../post/copy-media-type.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import { MediaTypeFolderBuilder } from "./helpers/media-type-folder-builder.js";
import { MediaTypeFolderTestHelper } from "./helpers/media-type-folder-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIATYPE_NAME = "_Test MediaType Copy";
const TEST_MEDIATYPE_COPY_NAME = "_Test MediaType Copy (copy)";
const TEST_FOLDER_NAME = "_Test Folder For Copy";

describe("copy-media-type", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test media types and folders
    await MediaTypeTestHelper.cleanup(TEST_MEDIATYPE_NAME);
    await MediaTypeTestHelper.cleanup(TEST_MEDIATYPE_COPY_NAME);
    await MediaTypeFolderTestHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should copy a media type to a folder", async () => {
    // Create a media type to copy
    const mediaTypeBuilder = await new MediaTypeBuilder()
      .withName(TEST_MEDIATYPE_NAME)
      .withIcon("icon-folder")
      .create();

    // Create a target folder
    const folderBuilder = await new MediaTypeFolderBuilder()
      .withName(TEST_FOLDER_NAME)
      .create();

    // Copy the media type
    const result = await CopyMediaTypeTool.handler(
      {
        id: mediaTypeBuilder.getId(),
        data: {
          target: {
            id: folderBuilder.getId(),
          },
        },
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Verify the media type was actually copied to the folder
    const copiedMediaTypes = await MediaTypeTestHelper.findMediaTypes(
      TEST_MEDIATYPE_COPY_NAME
    );
    expect(copiedMediaTypes.length).toBeGreaterThan(0);
    const copiedMediaType = copiedMediaTypes[0];
    expect(copiedMediaType.parent?.id).toBe(folderBuilder.getId());
  });

  it("should copy a media type to root", async () => {
    // Create a media type to copy
    const mediaTypeBuilder = await new MediaTypeBuilder()
      .withName(TEST_MEDIATYPE_NAME)
      .withIcon("icon-folder")
      .create();

    // Copy the media type to root (no target)
    const result = await CopyMediaTypeTool.handler(
      {
        id: mediaTypeBuilder.getId(),
        data: {
          target: null,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Verify the media type was actually copied to root
    const copiedMediaTypes = await MediaTypeTestHelper.findMediaTypes(
      TEST_MEDIATYPE_COPY_NAME
    );
    expect(copiedMediaTypes.length).toBeGreaterThan(0);
    const copiedMediaType = copiedMediaTypes[0];
    expect(copiedMediaType.parent).toBeNull();
  });

  it("should handle non-existent media type", async () => {
    const result = await CopyMediaTypeTool.handler(
      {
        id: BLANK_UUID,
        data: {
          target: null,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
