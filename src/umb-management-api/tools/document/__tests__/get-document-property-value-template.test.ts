import GetDocumentPropertyValueTemplateTool from "../get/get-document-property-value-template.js";
import { jest } from "@jest/globals";

describe("get-document-property-value-template", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should list all available property value templates when no editorAlias is provided", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      {},
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
    expect(text).toContain("Available Property Value Templates:");
    expect(text).toContain("Textbox");
    expect(text).toContain("BlockList");
    expect(text).toContain("MediaPicker3");
    expect(text).toContain("RichTextEditor");
    expect(text).toContain("get-document-property-value-template with a specific editorAlias");
  });

  it("should return template for a specific property editor by editorAlias", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "Umbraco.TextBox" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
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
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "Textbox" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
    expect(text).toContain("Property Value Template: Textbox");
    expect(text).toContain("Umbraco.TextBox");
  });

  it("should be case-insensitive when finding property editors", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "umbraco.textbox" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
    expect(text).toContain("Property Value Template: Textbox");
  });

  it("should include notes for editors with special requirements", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "Umbraco.BlockList" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
    expect(text).toContain("IMPORTANT NOTES:");
    expect(text).toContain("Complex structure");
  });

  it("should return error for non-existent property editor", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "NonExistent.Editor" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.isError).toBe(true);
    const text = result.content[0].text as string;
    expect(text).toContain("not found");
    expect(text).toContain("Available editor aliases:");
  });

  it("should return complex value structures for BlockGrid", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "Umbraco.BlockGrid" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
    expect(text).toContain("Property Value Template: BlockGrid");
    expect(text).toContain("layout");
    expect(text).toContain("contentData");
    expect(text).toContain("settingsData");
    expect(text).toContain("expose");
    expect(text).toContain("IMPORTANT NOTES:");
  });

  it("should return complex value structures for RichTextEditor", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "Umbraco.RichText" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
    expect(text).toContain("Property Value Template: RichTextEditor");
    expect(text).toContain("markup");
    expect(text).toContain("blocks");
  });

  it("should include notes for ImageCropper requiring temporary file", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "Umbraco.ImageCropper" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
    expect(text).toContain("IMPORTANT NOTES:");
    expect(text).toContain("temporary file");
    expect(text).toContain("temporaryFileId");
  });

  it("should include notes for MediaPicker3 with key information", async () => {
    // Act
    const result = await GetDocumentPropertyValueTemplateTool().handler(
      { editorAlias: "Umbraco.MediaPicker3" },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    const text = result.content[0].text as string;
    expect(text).toContain("mediaKey");
    expect(text).toContain("key");
  });
});
