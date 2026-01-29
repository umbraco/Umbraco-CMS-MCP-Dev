import GetRecycleBinMediaRootTool from "../items/get/get-recycle-bin-root.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIA_NAME = "_Test Media Root";

describe("get-recycle-bin-media-root", () => {
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

  it("should get root items from recycle bin", async () => {
    // Create a media item and move it to recycle bin
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    await builder.moveToRecycleBin();

    // Get root items
    const result = await GetRecycleBinMediaRootTool.handler(
      {
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    // Use createSnapshotResult for normalized snapshot
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
