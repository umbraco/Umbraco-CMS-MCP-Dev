import GetMediaByIdTool from "../get/get-media-by-id.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

const TEST_MEDIA_NAME = "_Test GetMediaById";

describe("get-media-by-id", () => {
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

  it("should get a media item by ID", async () => {
    // Create a media item
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();
    const id = builder.getId();

    // Get by ID
    const result = await GetMediaByIdTool.handler(
      { id } as any,
      createMockRequestHandlerExtra()
    );

    expect(createSnapshotResult(result, id)).toMatchSnapshot();
  });

  it("should return error for non-existent ID", async () => {
    const result = await GetMediaByIdTool.handler(
      { id: BLANK_UUID } as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
