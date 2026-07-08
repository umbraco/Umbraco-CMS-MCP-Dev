import GetTemplateAncestorsBatchTool from "../items/get/get-ancestors-batch.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { TemplateTestHelper } from "./helpers/template-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-template-ancestors-batch", () => {
  const TEST_TEMPLATE_NAME = "_Test AncestorsBatch Template";
  setupTestEnvironment();

  afterEach(async () => {
    await TemplateTestHelper.cleanup(TEST_TEMPLATE_NAME);
  });

  it("should return an ancestor entry per requested Id", async () => {
    const builder = await new TemplateBuilder()
      .withName(TEST_TEMPLATE_NAME)
      .create();

    const result = await GetTemplateAncestorsBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetTemplateAncestorsBatchTool, result);
    expect(data.items).toHaveLength(1);
    expect(Array.isArray(data.items[0].ancestors)).toBe(true);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
