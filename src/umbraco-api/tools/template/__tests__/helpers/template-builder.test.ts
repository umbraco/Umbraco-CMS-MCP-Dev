import { TemplateBuilder } from "./template-builder.js";
import { jest } from "@jest/globals";

describe("TemplateBuilder", () => {
  let helper: TemplateBuilder;

  beforeEach(() => {
    helper = new TemplateBuilder();
  });

  afterEach(async () => {
    await helper.cleanup();
  });

  it("should create a template with name", async () => {
    await helper
      .withName("Test Template")
      .create();

    expect(helper.getId()).toBeDefined();
    expect(await helper.verify()).toBe(true);
  });

  it("should create template with all properties", async () => {
    const content = "<h1>@Model.Title</h1>";
    
    await helper
      .withName("Full Template")
      .withAlias("custom-alias")
      .withContent(content)
      .create();

    expect(helper.getId()).toBeDefined();
    expect(helper.getAlias()).toBe("custom-alias");
    
    const createdItem = helper.getCreatedItem();
    expect(createdItem).toBeDefined();
    expect(createdItem.name).toBe("Full Template");
  });

  it("should throw error when trying to get ID before creation", () => {
    expect(() => helper.getId()).toThrow("No template has been created yet");
  });

  it("should throw error when trying to verify before creation", async () => {
    await expect(helper.verify()).rejects.toThrow("No template has been created yet");
  });

  it("should support withParent method for consistency", () => {
    helper.withName("Test Template").withParent("parent-id");
    const model = helper.build();
    expect(model.name).toBe("Test Template");
    // Note: withParent doesn't affect the model since templates don't support parent relationships
  });

  it("should require name and alias for creation", async () => {
    const builder = new TemplateBuilder();
    await expect(builder.create()).rejects.toThrow("Name and alias are required");
  });
}); 
