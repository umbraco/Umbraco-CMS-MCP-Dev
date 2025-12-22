import GetDataTypePropertyEditorTemplateTool from "../get/get-data-type-property-editor-template.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra, createToolParams, getResultText } from "@/test-helpers/create-mock-request-handler-extra.js";

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
      createToolParams({}),
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = getResultText(result);
    expect(text).toContain("Available Property Editor Templates:");
    expect(text).toContain("Textbox");
    expect(text).toContain("Toggle");
    expect(text).toContain("RichTextEditor_TinyMCE");
    expect(text).toContain("get-data-type-property-editor-template with a specific editorName");
  });

  it("should return template for a specific property editor", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "Textbox" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = getResultText(result);
    expect(text).toContain("Property Editor Template: Textbox");
    expect(text).toContain("editorAlias");
    expect(text).toContain("editorUiAlias");
    expect(text).toContain("Umbraco.TextBox");
    expect(text).toContain("Umb.PropertyEditorUi.TextBox");
    expect(text).toContain("Usage with create-data-type:");
  });

  it("should be case-insensitive when finding property editors", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "textbox" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = getResultText(result);
    expect(text).toContain("Property Editor Template: Textbox");
  });

  it("should include notes for editors that have special requirements", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "BlockList" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = getResultText(result);
    expect(text).toContain("IMPORTANT NOTES:");
    expect(text).toContain("when creating new block list data types always create the required element types first");
  });

  it("should return error for non-existent property editor", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "NonExistentEditor" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBe(true);
    const text = getResultText(result);
    expect(text).toContain("not found");
    expect(text).toContain("Available templates:");
  });

  it("should include configuration values for editors with settings", async () => {
    // Act
    const result = await GetDataTypePropertyEditorTemplateTool.handler(
      { editorName: "Toggle" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = getResultText(result);
    expect(text).toContain("values");
    expect(text).toContain("default");
    expect(text).toContain("showLabels");
  });
});
