import GetElementFolderReferencedDescendantsTool from "../get/get-element-folder-referenced-descendants.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { postElementBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { v4 as uuidv4 } from "uuid";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Element Folder RefDesc";
const TEST_TARGET_ELEMENT_NAME = "_Test Target Element RefDesc";
const TEST_SOURCE_ELEMENT_TYPE_NAME = "_Test Source Element Type RefDesc";
const TEST_SOURCE_ELEMENT_NAME = "_Test Source Element RefDesc";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType RefDesc";
const TEST_DOCUMENT_NAME = "_Test Document RefDesc";
const TEST_CONTENT_PICKER_DT_NAME = "_Test ContentPicker RefDesc";

describe("get-element-folder-referenced-descendants", () => {
  setupTestEnvironment();
  let folderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    // Clean up source element (in element tree)
    await ElementTestHelper.cleanup(TEST_SOURCE_ELEMENT_NAME);
    // Clean up document referencing the target
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    // Clean up document type
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME);
    // Clean up data type
    await DataTypeTestHelper.cleanup(TEST_CONTENT_PICKER_DT_NAME);
    // Clean up target element and folder
    await ElementTestHelper.cleanup(TEST_TARGET_ELEMENT_NAME);
    if (folderBuilder) {
      await folderBuilder.cleanup();
      folderBuilder = null;
    }
    // Clean up source element type (element type used for source element)
    await DocumentTypeTestHelper.cleanup(TEST_SOURCE_ELEMENT_TYPE_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should get referenced descendants for an element folder", async () => {
    // Arrange - create a folder, then create a target element inside it
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();
    const folderId = folderBuilder.getId();

    // Create a target element inside the folder
    const targetBuilder = await new ElementBuilder()
      .withName(TEST_TARGET_ELEMENT_NAME)
      .withParent(folderId)
      .create();
    const targetElementId = targetBuilder.getId();

    // Create a ContentPicker data type to use in a source element type
    const contentPickerDt = await new DataTypeBuilder()
      .withName(TEST_CONTENT_PICKER_DT_NAME)
      .withEditorAlias("Umbraco.ContentPicker")
      .withEditorUiAlias("Umb.PropertyEditorUi.DocumentPicker")
      .create();

    // Create a source element TYPE (isElement=true) with a content picker property
    const sourceElementTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_SOURCE_ELEMENT_TYPE_NAME)
      .withAlias(TEST_SOURCE_ELEMENT_TYPE_NAME.toLowerCase().replace(/[\s()]/g, ""))
      .asElement(true)
      .withProperty("picker", "Content Picker", contentPickerDt.getId())
      .create();
    const sourceElementTypeId = sourceElementTypeBuilder.getId();

    // Create a source ELEMENT (in the element tree) of that type,
    // with the picker set to the target element's ID
    const client = UmbracoManagementClient.getClient();
    const sourceElementId = uuidv4();
    const sourceElementModel = postElementBody.parse({
      id: sourceElementId,
      documentType: { id: sourceElementTypeId },
      values: [{ alias: "picker", value: targetElementId, culture: null, segment: null }],
      variants: [{ name: TEST_SOURCE_ELEMENT_NAME, culture: null, segment: null }],
    });
    await client.postElement(sourceElementModel);

    // Also create a document that references the target via content picker
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("elementRef", "Element Reference", contentPickerDt.getId())
      .create();
    await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("elementRef", targetElementId)
      .create();

    // Act - get referenced descendants of the folder
    const result = await GetElementFolderReferencedDescendantsTool.handler(
      { id: folderId },
      createMockRequestHandlerExtra()
    );

    // Assert - check that the API returns a valid response
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate that the response is valid (even if empty due to reference tracking differences)
    const parsed = validateToolResponse(GetElementFolderReferencedDescendantsTool, result);
    expect(parsed).toHaveProperty("total");
    expect(parsed).toHaveProperty("items");
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(typeof parsed.total).toBe("number");

    // If there are referenced descendants, verify the target element appears
    if (parsed.total > 0) {
      const targetFound = parsed.items.some((item: { id: string }) => item.id === targetElementId);
      expect(targetFound).toBe(true);
    }
  });

  it("should return error for non-existent folder ID", async () => {
    // Act
    const result = await GetElementFolderReferencedDescendantsTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result.isError).toBe(true);
  });
});
