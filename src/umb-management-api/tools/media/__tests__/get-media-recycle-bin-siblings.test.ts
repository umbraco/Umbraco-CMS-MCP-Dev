import GetMediaRecycleBinSiblingsTool from "../items/get/get-recycle-bin-siblings.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_PARENT_NAME = "_Test Parent Media Recycle Bin Siblings";
const TEST_SIBLING1_NAME = "_Test Sibling Recycle Bin 1";
const TEST_SIBLING2_NAME = "_Test Sibling Recycle Bin 2";

describe("get-media-recycle-bin-siblings", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up test media from recycle bin
    await MediaTestHelper.restoreFromRecycleBin(TEST_SIBLING1_NAME);
    await MediaTestHelper.restoreFromRecycleBin(TEST_SIBLING2_NAME);
    await MediaTestHelper.restoreFromRecycleBin(TEST_PARENT_NAME);

    await MediaTestHelper.cleanup(TEST_SIBLING1_NAME);
    await MediaTestHelper.cleanup(TEST_SIBLING2_NAME);
    await MediaTestHelper.cleanup(TEST_PARENT_NAME);
  });

  it("should get sibling media items in recycle bin", async () => {
    // Arrange: Create parent folder with two child media items, then move all to recycle bin
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

    const sibling2Builder = await new MediaBuilder()
      .withName(TEST_SIBLING2_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder2.getId())
      .withParent(parentBuilder.getId())
      .create();

    // Move parent to recycle bin (which moves all children)
    await parentBuilder.moveToRecycleBin();

    // Find the sibling in recycle bin to get its new ID
    const sibling1InRecycleBin = await MediaTestHelper.findMediaInRecycleBin(TEST_SIBLING1_NAME);

    // Act: Get siblings of the first child in recycle bin
    const result = await GetMediaRecycleBinSiblingsTool.handler(
      {
        target: sibling1InRecycleBin?.id,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify the handler response using snapshot
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent target in recycle bin", async () => {
    // Act: Try to get siblings for non-existent media item in recycle bin
    const result = await GetMediaRecycleBinSiblingsTool.handler(
      {
        target: BLANK_UUID,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Assert: Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
