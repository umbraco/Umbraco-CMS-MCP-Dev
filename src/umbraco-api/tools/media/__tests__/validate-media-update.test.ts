import ValidateMediaUpdateTool from "../put/validate-media.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIA_NAME = "_Test ValidateMediaUpdate";
const UPDATED_MEDIA_NAME = "_Test ValidateMediaUpdate Updated";

describe("validate-media-update", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
    await MediaTestHelper.cleanup(UPDATED_MEDIA_NAME);
  });

  it("should validate a valid media update", async () => {
    const tempFileBuilder1 = await new TemporaryFileBuilder().withExampleFile().create();
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder1.getId())
      .create();

    const tempFileBuilder2 = await new TemporaryFileBuilder().withExampleFile().create();
    const updateModel = new MediaBuilder()
      .withName(UPDATED_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder2.getId())
      .build();

    const result = await ValidateMediaUpdateTool.handler(
      { id: builder.getId(), data: updateModel } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });

  it("should handle validation for non-existent media", async () => {
    const tempFileBuilder = await new TemporaryFileBuilder().withExampleFile().create();
    const updateModel = new MediaBuilder()
      .withName(UPDATED_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .build();

    const result = await ValidateMediaUpdateTool.handler(
      { id: BLANK_UUID, data: updateModel } as any,
      createMockRequestHandlerExtra()
    );
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
