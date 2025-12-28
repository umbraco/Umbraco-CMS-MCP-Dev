import UpdateTemplateTool from "../put/update-template.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { TemplateTestHelper } from "./helpers/template-helper.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_TEMPLATE_NAME = "_Test Template Update";
const UPDATED_TEMPLATE_NAME = "_Updated Template";
const NON_EXISTENT_TEMPLATE_NAME = "_Non Existent Template";

describe("update-template", () => {
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
    await TemplateTestHelper.cleanup(UPDATED_TEMPLATE_NAME);
  });

  it("should update a template", async () => {
    await builder.withName(TEST_TEMPLATE_NAME).create();
    const result = await UpdateTemplateTool.handler(
      {
        id: builder.getId(),
        data: {
          name: UPDATED_TEMPLATE_NAME,
          alias: UPDATED_TEMPLATE_NAME.toLowerCase().replace(/\s+/g, "-"),
          content: "<h1>@Model.UpdatedTitle</h1>",
        },
      },
      { signal: new AbortController().signal }
    );
    expect(result).toMatchSnapshot();
    const items = await TemplateTestHelper.findTemplates(UPDATED_TEMPLATE_NAME);
    items[0].id = BLANK_UUID;
    expect(items).toMatchSnapshot();
  });

  it("should handle non-existent template", async () => {
    const result = await UpdateTemplateTool.handler(
      {
        id: BLANK_UUID,
        data: {
          name: NON_EXISTENT_TEMPLATE_NAME,
          alias: NON_EXISTENT_TEMPLATE_NAME.toLowerCase().replace(/\s+/g, "-"),
          content: "<h1>@Model.Title</h1>",
        },
      },
      { signal: new AbortController().signal }
    );
    expect(result).toMatchSnapshot();
  });
});
