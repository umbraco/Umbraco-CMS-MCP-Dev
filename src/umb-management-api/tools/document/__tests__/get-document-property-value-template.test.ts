import GetDocumentPropertyValueTemplateTool from "../get/get-document-property-value-template.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-document-property-value-template", () => {
  setupTestEnvironment();
  it("should list all available property value templates when no editorAlias is provided", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: undefined },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("Available Property Value Templates:");
    expect(text).toContain("Textbox");
    expect(text).toContain("BlockList");
    expect(text).toContain("MediaPicker3");
    expect(text).toContain("RichTextEditor");
    expect(text).toContain("get-document-property-value-template with a specific editorAlias");
  });

  it("should return template for a specific property editor by editorAlias", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "Umbraco.TextBox" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("Property Value Template: Textbox");
    expect(text).toContain("editorAlias");
    expect(text).toContain("Umbraco.TextBox");
    expect(text).toContain("value");
    expect(text).toContain("Usage with create-document:");
    expect(text).toContain("culture");
    expect(text).toContain("segment");
    expect(text).toContain("alias");
  });

  it("should return template by friendly name", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "Textbox" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("Property Value Template: Textbox");
    expect(text).toContain("Umbraco.TextBox");
  });

  it("should be case-insensitive when finding property editors", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "umbraco.textbox" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("Property Value Template: Textbox");
  });

  it("should include notes for editors with special requirements", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "Umbraco.BlockList" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("IMPORTANT NOTES:");
    expect(text).toContain("Complex structure");
  });

  it("should return error for non-existent property editor", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "NonExistent.Editor" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    expect(result.isError).toBe(true);
    const text = textContent.text;
    expect(text).toContain("not found");
    expect(text).toContain("Available editor aliases:");
  });

  it("should return complex value structures for BlockGrid", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "Umbraco.BlockGrid" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("Property Value Template: BlockGrid");
    expect(text).toContain("layout");
    expect(text).toContain("contentData");
    expect(text).toContain("settingsData");
    expect(text).toContain("expose");
    expect(text).toContain("IMPORTANT NOTES:");
  });

  it("should return complex value structures for RichTextEditor", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "Umbraco.RichText" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("Property Value Template: RichTextEditor");
    expect(text).toContain("markup");
    expect(text).toContain("blocks");
  });

  it("should include notes for ImageCropper requiring temporary file", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "Umbraco.ImageCropper" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("IMPORTANT NOTES:");
    expect(text).toContain("temporary file");
    expect(text).toContain("temporaryFileId");
  });

  it("should include notes for MediaPicker3 with key information", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool.handler(
      { editorAlias: "Umbraco.MediaPicker3" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.content).toHaveLength(1);
    const textContent = result.content[0] as { type: "text"; text: string };
    expect(textContent.type).toBe("text");
    const text = textContent.text;
    expect(text).toContain("mediaKey");
    expect(text).toContain("key");
  });
});
