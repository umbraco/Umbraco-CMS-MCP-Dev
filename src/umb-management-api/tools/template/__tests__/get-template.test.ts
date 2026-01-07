import { getTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetTemplateTool from "../get/get-template.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_TEMPLATE_NAME = "_Test Template Get";

describe("get-template", () => {
  setupTestEnvironment();
  let builder: TemplateBuilder;

  beforeEach(() => {
    builder = new TemplateBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
  });

  it("should get a template by id", async () => {
    await builder.withName(TEST_TEMPLATE_NAME).create();
    const params = getTemplateByIdParams.parse({ id: builder.getId() });
    const result = await GetTemplateTool.handler(params, createMockRequestHandlerExtra());
    const data = validateToolResponse(GetTemplateTool, result);
    expect(data).toBeDefined();
    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should handle non-existent template", async () => {
    const params = getTemplateByIdParams.parse({ id: BLANK_UUID });
    const result = await GetTemplateTool.handler(params, createMockRequestHandlerExtra());
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
