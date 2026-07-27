import SortMediaTool from "../put/sort-media.js";
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

const TEST_MEDIA_NAME = "_Test Media Sort";
const TEST_MEDIA_NAME_2 = "_Test Media Sort 2";

describe("sort-media", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;
  let tempFileBuilder2: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder().withExampleFile().create();
    tempFileBuilder2 = await new TemporaryFileBuilder().withExampleFile().create();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME_2);
  });

  it("should sort media items", async () => {
    const folderBuilder = await new MediaBuilder().withName(TEST_MEDIA_NAME).withFolderMediaType().create();
    const media1Builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .withParent(folderBuilder.getId())
      .create();
    const media2Builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME_2)
      .withImageMediaType()
      .withImageValue(tempFileBuilder2.getId())
      .withParent(folderBuilder.getId())
      .create();

    var folderOrder = await folderBuilder.getChildren();

    const result = await SortMediaTool.handler(
      { parent: { id: folderBuilder.getId() }, sorting: [{ id: media2Builder.getId(), sortOrder: 0 }] } as any,
      createMockRequestHandlerExtra()
    );

    var folderReOrdered = await folderBuilder.getChildren();
    expect(folderReOrdered.items).toEqual(folderOrder.items.reverse());
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent parent", async () => {
    const result = await SortMediaTool.handler(
      { parent: { id: BLANK_UUID }, sorting: [] } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
