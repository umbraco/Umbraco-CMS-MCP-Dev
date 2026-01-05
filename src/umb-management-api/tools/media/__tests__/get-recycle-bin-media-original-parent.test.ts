import GetRecycleBinMediaOriginalParentTool from "../get/get-recycle-bin-media-original-parent.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import MoveMediaToRecycleBinTool from "../put/move-to-recycle-bin.js";

const TEST_MEDIA_NAME = "_Test Media Original Parent";
const TEST_PARENT_MEDIA_NAME = "_Test Parent Media";

// Helper to get text content from result
const getResultText = (result: { content: Array<{ text?: string }> }): string => {
  return (result.content[0] as { text: string }).text ?? "";
};

describe("get-recycle-bin-media-original-parent", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();
  });

  afterEach(async () => {
    // Clean up in parallel to speed up tests
    await Promise.all([
      MediaTestHelper.cleanup(TEST_MEDIA_NAME),
      MediaTestHelper.cleanup(TEST_PARENT_MEDIA_NAME)
    ]);
  }, 10000);

  it("should return original parent information for recycled media", async () => {
    // Create a parent media folder
    const parentMediaBuilder = await new MediaBuilder()
      .withName(TEST_PARENT_MEDIA_NAME)
      .withFolderMediaType()
      .create();

    // Create child media under the parent
    const childMediaBuilder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .withParent(parentMediaBuilder.getId())
      .create();

    // Move child media to recycle bin
    await MoveMediaToRecycleBinTool.handler(
      {
        id: childMediaBuilder.getId()
      },
      createMockRequestHandlerExtra()
    );

    // Get original parent information
    const result = await GetRecycleBinMediaOriginalParentTool.handler(
      {
        id: childMediaBuilder.getId()
      },
      createMockRequestHandlerExtra()
    );

    // Verify parent information is returned (uses legacy content format)
    const parsed = JSON.parse(getResultText(result));
    expect(parsed).toHaveProperty('id');
    // Verify the parent ID matches our created parent
    expect(parsed.id).toBe(parentMediaBuilder.getId());

    // Use createSnapshotResult with the specific ID to normalize
    const normalizedResult = createSnapshotResult(result, parsed.id);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return null for media that was at root level", async () => {
    // Create media at root level (no parent)
    const mediaBuilder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    // Move media to recycle bin
    await MoveMediaToRecycleBinTool.handler(
      {
        id: mediaBuilder.getId()
      },
      createMockRequestHandlerExtra()
    );

    // Get original parent information
    const result = await GetRecycleBinMediaOriginalParentTool.handler(
      {
        id: mediaBuilder.getId()
      },
      createMockRequestHandlerExtra()
    );

    // Should return null for root-level items (uses legacy content format)
    const parsed = JSON.parse(getResultText(result));
    expect(parsed).toBeNull();
    expect(result).toMatchSnapshot();
  });

  it("should handle invalid media id", async () => {
    // Test with non-existent ID - this should return an error
    const result = await GetRecycleBinMediaOriginalParentTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000"
      },
      createMockRequestHandlerExtra()
    );

    // Verify it's an error response
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});