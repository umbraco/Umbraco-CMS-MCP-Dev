import CreateTemplateTool from "../post/create-template.js";
import { TemplateTestHelper } from "./helpers/template-helper.js";
import { jest } from "@jest/globals";

const TEST_TEMPLATE_NAME = "_Test Template Created";
const EXISTING_TEMPLATE_NAME = "_Existing Template";

describe("create-template", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await TemplateTestHelper.cleanup(TEST_TEMPLATE_NAME);
    await TemplateTestHelper.cleanup(EXISTING_TEMPLATE_NAME);
  });

  it("should create a template", async () => {
    const result = await CreateTemplateTool.handler({
      name: TEST_TEMPLATE_NAME,
      alias: TEST_TEMPLATE_NAME.toLowerCase().replace(/\s+/g, "-"),
      content: "<h1>@Model.Title</h1>"
    }, { signal: new AbortController().signal });

    expect(result).toMatchSnapshot();

    const items = await TemplateTestHelper.findTemplates(TEST_TEMPLATE_NAME);
    items[0].id = "NORMALIZED_ID";
    expect(items).toMatchSnapshot();
  });

  it("should handle existing template", async () => {
    // First create the template
    await CreateTemplateTool.handler({
      name: EXISTING_TEMPLATE_NAME,
      alias: EXISTING_TEMPLATE_NAME.toLowerCase().replace(/\s+/g, "-"),
      content: "<h1>@Model.Title</h1>"
    }, { signal: new AbortController().signal });

    // Try to create it again
    const result = await CreateTemplateTool.handler({
      name: EXISTING_TEMPLATE_NAME,
      alias: EXISTING_TEMPLATE_NAME.toLowerCase().replace(/\s+/g, "-"),
      content: "<h1>@Model.Title</h1>"
    }, { signal: new AbortController().signal });

    expect(result).toMatchSnapshot();
  });
});
