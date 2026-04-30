import GetMediaTypeAllowedParentsTool from "../get/get-media-type-allowed-parents.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-type-allowed-parents", () => {
  const TEST_MEDIATYPE_NAME = "_Test AllowedParents MediaType";
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIATYPE_NAME);
  });

  it("should return an allowedParentIds array for a media type", async () => {
    const builder = await new MediaTypeBuilder()
      .withName(TEST_MEDIATYPE_NAME)
      .create();

    const result = await GetMediaTypeAllowedParentsTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetMediaTypeAllowedParentsTool, result);
    expect(Array.isArray(data.allowedParentIds)).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
