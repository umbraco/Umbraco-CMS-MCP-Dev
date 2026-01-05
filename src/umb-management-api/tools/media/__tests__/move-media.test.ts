import MoveMediaTool from "../put/move-media.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEDIA_SOURCE_NAME = "_Test Media Move";
const TEST_MEDIA_TARGET_NAME = "_Test Media Move Target";
const TEST_MEDIA_CONTENT_NAME = "_Test Media Content";

describe("move-media", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder().withExampleFile().create();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_SOURCE_NAME);
    await MediaTestHelper.cleanup(TEST_MEDIA_TARGET_NAME);
    await MediaTestHelper.cleanup(TEST_MEDIA_CONTENT_NAME);
  });

  it("should move a media item to another folder", async () => {
    const folderSourceBuilder = await new MediaBuilder().withName(TEST_MEDIA_SOURCE_NAME).withFolderMediaType().create();
    const folderTargetBuilder = await new MediaBuilder().withName(TEST_MEDIA_TARGET_NAME).withFolderMediaType().create();
    const contentBuilder = await new MediaBuilder()
      .withName(TEST_MEDIA_CONTENT_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .withParent(folderSourceBuilder.getId())
      .create();

    const result = await MoveMediaTool.handler(
      { id: contentBuilder.getId(), data: { target: { id: folderTargetBuilder.getId() } } } as any,
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(TEST_MEDIA_CONTENT_NAME);
    expect(found).toBeDefined();
    expect(found!.parent?.id).toBe(folderTargetBuilder.getId());
  });

  it("should handle moving to non-existent target", async () => {
    const folderSourceBuilder = await new MediaBuilder().withName(TEST_MEDIA_SOURCE_NAME).withFolderMediaType().create();
    const contentBuilder = await new MediaBuilder()
      .withName(TEST_MEDIA_CONTENT_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .withParent(folderSourceBuilder.getId())
      .create();

    const result = await MoveMediaTool.handler(
      { id: contentBuilder.getId(), data: { target: { id: BLANK_UUID } } } as any,
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });

  it("should handle moving non-existent media", async () => {
    const result = await MoveMediaTool.handler(
      { id: BLANK_UUID, data: { target: { id: BLANK_UUID } } } as any,
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
