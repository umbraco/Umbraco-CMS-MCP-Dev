import GetMediaAncestorsBatchTool from "../items/get/get-ancestors-batch.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-ancestors-batch", () => {
  const TEST_ROOT_NAME = "_Test AncestorsBatch Folder";
  const TEST_CHILD_NAME = "_Test AncestorsBatch Child";
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_ROOT_NAME);
    await MediaTestHelper.cleanup(TEST_CHILD_NAME);
  });

  it("should return an ancestor chain for a child media item", async () => {
    const parent = await new MediaBuilder()
      .withName(TEST_ROOT_NAME)
      .withFolderMediaType()
      .create();

    const child = await new MediaBuilder()
      .withName(TEST_CHILD_NAME)
      .withFolderMediaType()
      .withParent(parent.getId())
      .create();

    const result = await GetMediaAncestorsBatchTool.handler(
      { id: [child.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetMediaAncestorsBatchTool, result);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].ancestors.length).toBeGreaterThan(0);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
