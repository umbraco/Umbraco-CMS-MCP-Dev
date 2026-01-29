import RestoreFromRecycleBinTool from "../put/restore-from-recycle-bin.js";
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

const TEST_MEDIA_NAME = "_Test Media Restore";

describe("restore-media-from-recycle-bin", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    await MediaTestHelper.emptyRecycleBin();
    tempFileBuilder = await new TemporaryFileBuilder().withExampleFile().create();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
  });

  it("should restore a media item from recycle bin", async () => {
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();
    await builder.moveToRecycleBin();

    const result = await RestoreFromRecycleBinTool.handler(
      { id: builder.getId() } as any,
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(TEST_MEDIA_NAME);
    expect(found).toBeDefined();
    expect(found!.variants[0].name).toBe(TEST_MEDIA_NAME);
  });

  it("should handle non-existent media", async () => {
    const result = await RestoreFromRecycleBinTool.handler(
      { id: BLANK_UUID } as any,
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
