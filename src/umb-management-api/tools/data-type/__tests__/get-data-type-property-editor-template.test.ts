import GetDataTypePropertyEditorTemplateTool from "../get/get-data-type-property-editor-template.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-data-type-property-editor-template", () => {
  setupTestEnvironment();
  it("should list all available property editors when no editorName is provided", async () => {
    // Act - Get property editors without specifying a name
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Assert - Verify list of available editors is returned
    const structured: { type: string; availableEditors: Array<{ name: string; notes?: string }> } =
      result.structuredContent as any;
    expect(structured.type).toBe("list");
    expect(structured.availableEditors).toBeDefined();
    const editorNames = structured.availableEditors.map(e => e.name);
    expect(editorNames).toContain("Textbox");
    expect(editorNames).toContain("Toggle");
    expect(editorNames).toContain("RichTextEditor_TinyMCE");
  });

  it("should return template for a specific property editor", async () => {
    // Act - Get template for Textbox editor
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "Textbox" },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify template is returned with correct properties
    const structured: { type: string; name: string; template: any } =
      result.structuredContent as any;
    expect(structured.type).toBe("template");
    expect(structured.name).toBe("Textbox");
    expect(structured.template.editorAlias).toBe("Umbraco.TextBox");
    expect(structured.template.editorUiAlias).toBe("Umb.PropertyEditorUi.TextBox");
  });

  it("should be case-insensitive when finding property editors", async () => {
    // Act - Get template using lowercase name
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "textbox" },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify template is found regardless of case
    const structured: { type: string; name: string; template: any } =
      result.structuredContent as any;
    expect(structured.type).toBe("template");
    expect(structured.name).toBe("Textbox");
  });

  it("should include notes for editors that have special requirements", async () => {
    // Act - Get template for BlockList editor
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "BlockList" },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify notes are included for complex editors
    const structured: { type: string; name: string; template: any } =
      result.structuredContent as any;
    expect(structured.type).toBe("template");
    expect(structured.template._notes).toBeDefined();
    expect(structured.template._notes).toContain("when creating new block list data types always create the required element types first");
  });

  it("should return error for non-existent property editor", async () => {
    // Act - Try to get template for non-existent editor
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "NonExistentEditor" },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify error response with available templates
    expect(result.isError).toBe(true);
    const structured: { title: string; detail: string; availableTemplates: string[] } =
      result.structuredContent as any;
    expect(structured.title).toBe("Property editor template not found");
    expect(structured.detail).toContain("not found");
    expect(structured.availableTemplates).toBeDefined();
  });

  it("should include configuration values for editors with settings", async () => {
    // Act - Get template for Toggle editor
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "Toggle" },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify configuration values are included
    const structured: { type: string; name: string; template: any } =
      result.structuredContent as any;
    expect(structured.type).toBe("template");
    expect(structured.template.values).toBeDefined();
    const aliases = structured.template.values.map((v: any) => v.alias);
    expect(aliases).toContain("default");
    expect(aliases).toContain("showLabels");
  });
});
