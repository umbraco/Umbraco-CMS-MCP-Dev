import GetRecycleBinMediaOriginalParentTool from "../get/get-recycle-bin-media-original-parent.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import MoveMediaToRecycleBinTool from "../put/move-to-recycle-bin.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIA_NAME = "_Test Media Original Parent";
const TEST_PARENT_MEDIA_NAME = "_Test Parent Media";

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
      } as any,
      createMockRequestHandlerExtra()
    );

    // Get original parent information
    const result = await GetRecycleBinMediaOriginalParentTool.handler(
      {
        id: childMediaBuilder.getId()
      } as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema and verify parent information
    const parsed = validateToolResponse(GetRecycleBinMediaOriginalParentTool, result);
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
      } as any,
      createMockRequestHandlerExtra()
    );

    // Get original parent information
    const result = await GetRecycleBinMediaOriginalParentTool.handler(
      {
        id: mediaBuilder.getId()
      } as any,
      createMockRequestHandlerExtra()
    );

    // For null responses, don't use createSnapshotResult as it can't handle null
    expect(result).toMatchSnapshot();

    // Should return null for root-level items
    expect(result.structuredContent).toBeNull();
  });

  it("should handle invalid media id", async () => {
    // Test with non-existent ID - this should return an error
    const result = await GetRecycleBinMediaOriginalParentTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000"
      } as any,
      createMockRequestHandlerExtra()
    );

    // For error responses, don't use createSnapshotResult as it expects JSON
    expect(result).toMatchSnapshot();

    // Verify it's an error response
    expect(result.isError).toBe(true);
  });
});
