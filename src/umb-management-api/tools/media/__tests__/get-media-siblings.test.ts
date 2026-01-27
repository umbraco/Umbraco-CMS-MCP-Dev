import GetMediaSiblingsTool from "../items/get/get-siblings.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_PARENT_NAME = "_Test Parent Media Siblings";
const TEST_SIBLING1_NAME = "_Test Sibling 1";
const TEST_SIBLING2_NAME = "_Test Sibling 2";

describe("get-media-siblings", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up test media
    await MediaTestHelper.cleanup(TEST_SIBLING1_NAME);
    await MediaTestHelper.cleanup(TEST_SIBLING2_NAME);
    await MediaTestHelper.cleanup(TEST_PARENT_NAME);
  });

  it("should get sibling media items", async () => {
    // Arrange: Create parent folder with two child media items
    const parentBuilder = await new MediaBuilder()
      .withName(TEST_PARENT_NAME)
      .withFolderMediaType()
      .create();

    const tempFileBuilder1 = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    const sibling1Builder = await new MediaBuilder()
      .withName(TEST_SIBLING1_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder1.getId())
      .withParent(parentBuilder.getId())
      .create();

    const tempFileBuilder2 = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    await new MediaBuilder()
      .withName(TEST_SIBLING2_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder2.getId())
      .withParent(parentBuilder.getId())
      .create();

    // Act: Get siblings of the first child
    const result = await GetMediaSiblingsTool.handler(
      {
        target: sibling1Builder.getId(),
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify the handler response using snapshot
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent target", async () => {
    // Act: Try to get siblings for non-existent media item
    const result = await GetMediaSiblingsTool.handler(
      {
        target: BLANK_UUID,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
