import ValidateMediaTool from "../post/validate-media.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEDIA_NAME = "_Test ValidateMedia";

async function buildValidationModel() {
  const tempFileBuilder = await new TemporaryFileBuilder().withExampleFile().create();
  const model = await new MediaBuilder()
    .withName(TEST_MEDIA_NAME)
    .withImageMediaType()
    .withImageValue(tempFileBuilder.getId())
    .build();
  return {
    values: model.values,
    variants: [{ name: TEST_MEDIA_NAME, culture: null, segment: null }],
    id: model.id,
    parent: model.parent ? { id: model.parent.id } : undefined,
    mediaType: model.mediaType,
  };
}

describe("validate-media", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
  });

  it("should validate a valid media", async () => {
    const model = await buildValidationModel();
    const result = await ValidateMediaTool.handler(model as any, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();
  });

  it("should handle invalid media model", async () => {
    const invalidModel = {
      values: [],
      variants: [{ name: "", culture: null, segment: null }],
      mediaType: undefined,
    };
    const result = await ValidateMediaTool.handler(invalidModel as any, createMockRequestHandlerExtra());
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
