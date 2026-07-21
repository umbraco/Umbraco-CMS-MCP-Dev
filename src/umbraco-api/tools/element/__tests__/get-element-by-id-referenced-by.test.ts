import GetElementByIdReferencedByTool from "../get/get-element-by-id-referenced-by.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element ReferencedBy";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType With ElementRef";
const TEST_DOCUMENT_NAME = "_Test Document Referencing Element";
const TEST_CONTENT_PICKER_DT_NAME = "_Test ContentPicker For ElementRef";

describe("get-element-by-id-referenced-by", () => {
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

  it("should get documents that reference a specific element", async () => {
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
    const referencingDoc = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("elementRef", elementId)
      .create();

    // Act - get items that reference the element
    const result = await GetElementByIdReferencedByTool.handler(
      { id: elementId },
      createMockRequestHandlerExtra()
    );

    // Assert - document referencing the element should appear
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate that the referencing document appears in the result
    const parsed = validateToolResponse(GetElementByIdReferencedByTool, result);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items.length).toBeGreaterThan(0);
    // The referencing document should be in the results
    const referencingDocId = referencingDoc.getId();
    const hasReferencingDoc = parsed.items.some((item: any) => item.id === referencingDocId);
    expect(hasReferencingDoc).toBe(true);
  });

  it("should handle non-existent element", async () => {
    // Act
    const result = await GetElementByIdReferencedByTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
