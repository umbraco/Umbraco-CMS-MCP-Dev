import GetMediaTypeAncestorsBatchTool from "../items/get/get-ancestors-batch.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-type-ancestors-batch", () => {
  const TEST_MEDIATYPE_NAME = "_Test AncestorsBatch MediaType";
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIATYPE_NAME);
  });

  it("should return an ancestor entry per requested Id", async () => {
    const builder = await new MediaTypeBuilder()
      .withName(TEST_MEDIATYPE_NAME)
      .create();

    const result = await GetMediaTypeAncestorsBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetMediaTypeAncestorsBatchTool, result);
    expect(data.items).toHaveLength(1);
    expect(Array.isArray(data.items[0].ancestors)).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
