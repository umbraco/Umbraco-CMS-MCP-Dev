import GetRecycleBinElementReferencedByTool from "../get/get-recycle-bin-element-referenced-by.js";
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

const TEST_ELEMENT_NAME = "_Test Element RecycleBin ReferencedBy";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType RecycleBin ElementRef";
const TEST_DOCUMENT_NAME = "_Test Document With Recycled ElementRef";
const TEST_CONTENT_PICKER_DT_NAME = "_Test ContentPicker RecycleBin";

describe("get-recycle-bin-element-referenced-by", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up referencing document first
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    // Clean up document type
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME);
    // Clean up data type
    await DataTypeTestHelper.cleanup(TEST_CONTENT_PICKER_DT_NAME);
    // Clean up element from recycle bin
    await ElementTestHelper.emptyRecycleBin();
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should list content referencing a recycled element", async () => {
    // Arrange - create an element
    const elementBuilder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();
    const elementId = elementBuilder.getId();

    // Create a ContentPicker data type and document type that references the element
    const contentPickerDt = await new DataTypeBuilder()
      .withName(TEST_CONTENT_PICKER_DT_NAME)
      .withEditorAlias("Umbraco.ContentPicker")
      .withEditorUiAlias("Umb.PropertyEditorUi.DocumentPicker")
      .create();

    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("elementRef", "Element Reference", contentPickerDt.getId())
      .create();

    // Create a document that references the element
    const referencingDoc = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("elementRef", elementId)
      .create();

    // Move the element to the recycle bin (the document still references it)
    await elementBuilder.moveToRecycleBin();

    // Act - get all content referencing any recycled element
    const result = await GetRecycleBinElementReferencedByTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - the document referencing the recycled element should appear
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate non-empty results
    const parsed = validateToolResponse(GetRecycleBinElementReferencedByTool, result);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it("should handle empty recycle bin gracefully", async () => {
    // Ensure recycle bin is empty
    await ElementTestHelper.emptyRecycleBin();

    // Act - call with no elements in recycle bin
    const result = await GetRecycleBinElementReferencedByTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - empty list is a valid response, not an error
    expect(result.isError).toBeFalsy();
    const parsed = validateToolResponse(GetRecycleBinElementReferencedByTool, result);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
  });
});
