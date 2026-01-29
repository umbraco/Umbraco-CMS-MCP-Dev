import { MediaTestHelper } from "./helpers/media-test-helper.js";
import GetMediaByIdArrayTool from "../get/get-media-by-id-array.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIA_NAME = "_Test Media";

describe("get-media-by-id-array", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
  });

  it("should get media items by id array", async () => {
    // Create test media
    const mediaBuilder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const result = await GetMediaByIdArrayTool.handler(
      {
        id: [mediaBuilder.getId()],
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent media", async () => {
    const result = await GetMediaByIdArrayTool.handler(
      {
        id: [BLANK_UUID],
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });

  it("should handle empty id array", async () => {
    const result = await GetMediaByIdArrayTool.handler(
      {
        id: [],
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });
});
