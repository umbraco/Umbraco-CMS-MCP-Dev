import UpdateMediaTool from "../put/update-media.js";
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

const TEST_MEDIA_NAME = "_Test Media Update";
const UPDATED_MEDIA_NAME = "_Test Media Updated";

describe("update-media", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder().withExampleFile().create();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
    await MediaTestHelper.cleanup(UPDATED_MEDIA_NAME);
  });

  it("should update a media item", async () => {
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const updateModel = new MediaBuilder()
      .withName(UPDATED_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .build();

    const result = await UpdateMediaTool.handler(
      { id: builder.getId(), data: updateModel } as any,
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(UPDATED_MEDIA_NAME);
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
    expect(MediaTestHelper.getNameFromItem(found!)).toBe(UPDATED_MEDIA_NAME);
  });

  it("should handle non-existent media", async () => {
    const updateModel = new MediaBuilder()
      .withName(UPDATED_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .build();

    const result = await UpdateMediaTool.handler(
      { id: BLANK_UUID, data: updateModel } as any,
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });

  it("should update media with new content", async () => {
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const newTempFile = await new TemporaryFileBuilder().withExampleFile().create();
    const updateModel = new MediaBuilder()
      .withName(UPDATED_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(newTempFile.getId())
      .build();

    const result = await UpdateMediaTool.handler(
      { id: builder.getId(), data: updateModel } as any,
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(UPDATED_MEDIA_NAME);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found!)).toBe(UPDATED_MEDIA_NAME);
    await newTempFile.cleanup();
  });
});
