import GetRecycleBinMediaChildrenTool from "../items/get/get-recycle-bin-children.js";
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
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIA_NAME = "_Test Media Children";
const TEST_CHILD_NAME = "_Test Media Child";

describe("get-recycle-bin-media-children", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    await MediaTestHelper.emptyRecycleBin();

    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();
  });

  afterEach(async () => {
    // Clean up any test media
    await MediaTestHelper.emptyRecycleBin();
  });

  it("should get children of a media item in recycle bin", async () => {
    // Create a parent media item
    const parentBuilder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withFolderMediaType()
      .create();

    // Create a child media item
    const childBuilder = await new MediaBuilder()
      .withName(TEST_CHILD_NAME)
      .withImageMediaType()
      .withParent(parentBuilder.getId())
      .withImageValue(tempFileBuilder.getId())
      .create();

    // Move parent to recycle bin (children will be moved automatically)
    await parentBuilder.moveToRecycleBin();

    // Get children
    const result = await GetRecycleBinMediaChildrenTool.handler(
      {
        parentId: parentBuilder.getId(),
        take: 10,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Use createSnapshotResult for normalized snapshot
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's outputSchema
    const response = validateToolResponse(GetRecycleBinMediaChildrenTool, result);
    expect(response.items).toHaveLength(1);
    expect(response.items[0].variants[0].name).toBe(TEST_CHILD_NAME);
  });

  it("should handle non-existent media", async () => {
    const result = await GetRecycleBinMediaChildrenTool.handler(
      {
        parentId: BLANK_UUID,
        take: 10,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
