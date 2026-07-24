import { TemplateBuilder } from "./template-builder.js";
import { TemplateTestHelper } from "./template-helper.js";
import { jest } from "@jest/globals";

describe("TemplateTestHelper", () => {
  let builder: TemplateBuilder;
  const TEST_TEMPLATE_NAME = "_Test TemplateHelper";

  beforeEach(() => {
    builder = new TemplateBuilder();
  });

  afterEach(async () => {
    await TemplateTestHelper.cleanup(TEST_TEMPLATE_NAME);
  });

  it("should verify a created template", async () => {
    await builder.withName(TEST_TEMPLATE_NAME).create();
    const id = builder.getId();
    expect(await TemplateTestHelper.verifyTemplate(id)).toBe(true);
  });

  it("should find templates by name", async () => {
    await builder.withName(TEST_TEMPLATE_NAME).create();
    const found = await TemplateTestHelper.findTemplates(TEST_TEMPLATE_NAME);
    expect(found.length).toBeGreaterThan(0);
    expect(found[0].name).toBe(TEST_TEMPLATE_NAME);
  });

  it("cleanup should remove all templates with the test name", async () => {
    await builder.withName(TEST_TEMPLATE_NAME).create();
    await TemplateTestHelper.cleanup(TEST_TEMPLATE_NAME);
    const found = await TemplateTestHelper.findTemplates(TEST_TEMPLATE_NAME);
    expect(found.length).toBe(0);
  });
});
