import DeleteTemplateTool from "../delete/delete-template.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { TemplateTestHelper } from "./helpers/template-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

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
