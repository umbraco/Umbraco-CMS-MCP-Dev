import CreateTemplateTool from "../post/create-template.js";
import { createTemplateOutputSchema } from "../post/create-template.js";
import { TemplateTestHelper } from "./helpers/template-helper.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_TEMPLATE_NAME = "_Test Template Created";
const EXISTING_TEMPLATE_NAME = "_Existing Template";

describe("create-template", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await TemplateTestHelper.cleanup(TEST_TEMPLATE_NAME);
    await TemplateTestHelper.cleanup(EXISTING_TEMPLATE_NAME);
  });

  it("should create a template", async () => {
    const result = await CreateTemplateTool.handler({
      name: TEST_TEMPLATE_NAME,
      alias: TEST_TEMPLATE_NAME.toLowerCase().replace(/\s+/g, "-"),
      content: "<h1>@Model.Title</h1>",
      id: undefined
    }, createMockRequestHandlerExtra());

    const responseData = validateStructuredContent(result, createTemplateOutputSchema);
    expect(responseData.message).toBe("Template created successfully");
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    const items = await TemplateTestHelper.findTemplates(TEST_TEMPLATE_NAME);
    expect(createSnapshotResult({ structuredContent: { items } })).toMatchSnapshot();
  });

  it("should handle existing template", async () => {
    // First create the template
    await CreateTemplateTool.handler({
      name: EXISTING_TEMPLATE_NAME,
      alias: EXISTING_TEMPLATE_NAME.toLowerCase().replace(/\s+/g, "-"),
      content: "<h1>@Model.Title</h1>",
      id: undefined
    }, createMockRequestHandlerExtra());

    // Try to create it again
    const result = await CreateTemplateTool.handler({
      name: EXISTING_TEMPLATE_NAME,
      alias: EXISTING_TEMPLATE_NAME.toLowerCase().replace(/\s+/g, "-"),
      content: "<h1>@Model.Title</h1>",
      id: undefined
    }, createMockRequestHandlerExtra());

    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
