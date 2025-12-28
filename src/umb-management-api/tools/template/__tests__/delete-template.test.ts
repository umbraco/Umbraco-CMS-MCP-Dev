import DeleteTemplateTool from "../delete/delete-template.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { TemplateTestHelper } from "./helpers/template-helper.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_TEMPLATE_NAME = "_Test Template Delete";

describe("delete-template", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should delete a template", async () => {
    const builder = await new TemplateBuilder()
      .withName(TEST_TEMPLATE_NAME)
      .create();
    const result = await DeleteTemplateTool.handler(
      {
        id: builder.getId(),
      },
      { signal: new AbortController().signal }
    );
    expect(result).toMatchSnapshot();
    const items = await TemplateTestHelper.findTemplates(TEST_TEMPLATE_NAME);
    expect(items).toHaveLength(0);
  });

  it("should handle non-existent template", async () => {
    const result = await DeleteTemplateTool.handler(
      {
        id: BLANK_UUID,
      },
      { signal: new AbortController().signal }
    );
    expect(result).toMatchSnapshot();
  });
});
