import GetElementAreReferencedTool from "../get/get-element-are-referenced.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element AreReferenced";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType With ElementPicker";
const TEST_DOCUMENT_NAME = "_Test Document With ElementRef";
const TEST_CONTENT_PICKER_DT_NAME = "_Test ContentPicker For Element";

describe("get-element-are-referenced", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_CONTENT_PICKER_DT_NAME);
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should detect when an element is referenced by a document", async () => {
    // Arrange - create an element to reference
    const elementBuilder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();
    const elementId = elementBuilder.getId();

    // Create a ContentPicker data type that can pick any content by ID
    const contentPickerDt = await new DataTypeBuilder()
      .withName(TEST_CONTENT_PICKER_DT_NAME)
      .withEditorAlias("Umbraco.ContentPicker")
      .withEditorUiAlias("Umb.PropertyEditorUi.DocumentPicker")
      .create();

    // Create a document type with a content picker property
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("elementRef", "Element Reference", contentPickerDt.getId())
      .create();

    // Create a document that references the element via the content picker
    await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("elementRef", elementId)
      .create();

    // Act - check if the element is referenced
    const result = await GetElementAreReferencedTool.handler(
      { id: [elementId] } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - the element should appear as referenced
    const normalizedResult = createSnapshotResult(result, elementId);
    expect(normalizedResult).toMatchSnapshot();

    // Validate that the element appears in the referenced list
    const parsed = validateToolResponse(GetElementAreReferencedTool, result);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items.length).toBeGreaterThan(0);
    expect(parsed.items[0].id).toBe(elementId);
  });

  it("should return empty result for non-referenced element id", async () => {
    // Act
    const result = await GetElementAreReferencedTool.handler(
      { id: ["00000000-0000-0000-0000-000000000000"] } as any,
      createMockRequestHandlerExtra()
    );

    // Assert - non-existent IDs return empty list, not an error
    expect(result.isError).toBeFalsy();
    const parsed = validateToolResponse(GetElementAreReferencedTool, result);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
  });
});
