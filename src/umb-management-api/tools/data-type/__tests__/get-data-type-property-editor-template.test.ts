import GetDataTypePropertyEditorTemplateTool from "../get/get-data-type-property-editor-template.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra, getStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-data-type-property-editor-template", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should list all available property editors when no editorName is provided", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Assert - now returns structuredContent
    const structured = getStructuredContent(result) as { type: string; availableEditors: Array<{ name: string; notes?: string }> };
    expect(structured.type).toBe("list");
    expect(structured.availableEditors).toBeDefined();
    const editorNames = structured.availableEditors.map(e => e.name);
    expect(editorNames).toContain("Textbox");
    expect(editorNames).toContain("Toggle");
    expect(editorNames).toContain("RichTextEditor_TinyMCE");
  });

  it("should return template for a specific property editor", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "Textbox" },
      createMockRequestHandlerExtra()
    );

    // Assert - now returns structuredContent
    const structured = getStructuredContent(result) as { type: string; name: string; template: any };
    expect(structured.type).toBe("template");
    expect(structured.name).toBe("Textbox");
    expect(structured.template.editorAlias).toBe("Umbraco.TextBox");
    expect(structured.template.editorUiAlias).toBe("Umb.PropertyEditorUi.TextBox");
  });

  it("should be case-insensitive when finding property editors", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "textbox" },
      createMockRequestHandlerExtra()
    );

    // Assert - now returns structuredContent
    const structured = getStructuredContent(result) as { type: string; name: string; template: any };
    expect(structured.type).toBe("template");
    expect(structured.name).toBe("Textbox");
  });

  it("should include notes for editors that have special requirements", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "BlockList" },
      createMockRequestHandlerExtra()
    );

    // Assert - now returns structuredContent
    const structured = getStructuredContent(result) as { type: string; name: string; template: any };
    expect(structured.type).toBe("template");
    expect(structured.template._notes).toBeDefined();
    expect(structured.template._notes).toContain("when creating new block list data types always create the required element types first");
  });

  it("should return error for non-existent property editor", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "NonExistentEditor" },
      createMockRequestHandlerExtra()
    );

    // Assert - now returns structuredContent with error
    expect(result.isError).toBe(true);
    const structured = getStructuredContent(result) as { title: string; detail: string; availableTemplates: string[] };
    expect(structured.title).toBe("Property editor template not found");
    expect(structured.detail).toContain("not found");
    expect(structured.availableTemplates).toBeDefined();
  });

  it("should include configuration values for editors with settings", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "Toggle" },
      createMockRequestHandlerExtra()
    );

    // Assert - now returns structuredContent
    const structured = getStructuredContent(result) as { type: string; name: string; template: any };
    expect(structured.type).toBe("template");
    expect(structured.template.values).toBeDefined();
    const aliases = structured.template.values.map((v: any) => v.alias);
    expect(aliases).toContain("default");
    expect(aliases).toContain("showLabels");
  });
});
