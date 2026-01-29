import DeleteTemplateTool from "../delete/delete-template.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { TemplateTestHelper } from "./helpers/template-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_TEMPLATE_NAME = "_Test Template Delete";

describe("delete-template", () => {
  setupTestEnvironment();

  it("should delete a template", async () => {
    const builder = await new TemplateBuilder()
      .withName(TEST_TEMPLATE_NAME)
      .create();
    const result = await DeleteTemplateTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
    const items = await TemplateTestHelper.findTemplates(TEST_TEMPLATE_NAME);
    expect(items).toHaveLength(0);
  });

  it("should handle non-existent template", async () => {
    const result = await DeleteTemplateTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
