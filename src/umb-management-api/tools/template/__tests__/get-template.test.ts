import { getTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetTemplateTool from "../get/get-template.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_TEMPLATE_NAME = "_Test Template Get";

describe("get-template", () => {
  let originalConsoleError: typeof console.error;
  let builder: TemplateBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder = new TemplateBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await builder.cleanup();
  });

  it("should get a template by id", async () => {
    await builder.withName(TEST_TEMPLATE_NAME).create();
    const params = getTemplateByIdParams.parse({ id: builder.getId() });
    const result = await GetTemplateTool.handler(params, {
      signal: new AbortController().signal,
    });
    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should handle non-existent template", async () => {
    const params = getTemplateByIdParams.parse({ id: BLANK_UUID });
    const result = await GetTemplateTool.handler(params, {
      signal: new AbortController().signal,
    });
    expect(result).toMatchSnapshot();
  });
});
