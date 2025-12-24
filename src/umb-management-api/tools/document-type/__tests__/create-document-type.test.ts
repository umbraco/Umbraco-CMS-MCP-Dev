import CreateDocumentTypeTool, { createDocumentTypeOutputSchema } from "../post/create-document-type.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import type { CreateDocumentTypeModel } from "../post/create-document-type.js";
import { DocumentTypeFolderBuilder } from "./helpers/document-type-folder-builder.js";
import type { DocumentTypeTreeItemResponseModel } from "@/umb-management-api/schemas/index.js";
import { TextString_DATA_TYPE_ID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra, validateStructuredContent, getResultText } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_DOCTYPE_NAME = "_Test DocumentType Created";
const EXISTING_DOCTYPE_NAME = "_Existing DocumentType";
const TEST_FOLDER_NAME = "_Test Folder DocumentType";
const TEST_DOCTYPE_WITH_PARENT_NAME = "_Test DocumentType With Parent";

describe("create-document-type", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Clean up any test document types
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(EXISTING_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_FOLDER_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_WITH_PARENT_NAME);
    console.error = originalConsoleError;
  });

  it("should create a document type", async () => {
    // Create document type model using builder
    const docTypeModel: CreateDocumentTypeModel = {
      name: TEST_DOCTYPE_NAME,
      alias: TEST_DOCTYPE_NAME.toLowerCase().replace(/\s+/g, ''),
      icon: "icon-document",
      allowedAsRoot: false,
      compositions: [],
      allowedDocumentTypes: [],
      properties: []
    };

    // Create the document type
    const result = await CreateDocumentTypeTool.handler(docTypeModel as any, createMockRequestHandlerExtra());

    // Extract ID for normalization
    const responseData = validateStructuredContent(result, createDocumentTypeOutputSchema);
    const documentTypeId = responseData.id;

    // Verify the handler response using snapshot
    expect(responseData.message).toBe("Document type created successfully");
    expect(createSnapshotResult(result, documentTypeId)).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const item = await DocumentTypeTestHelper.findDocumentType(TEST_DOCTYPE_NAME);
    expect(item).toBeDefined();
    expect(DocumentTypeTestHelper.normaliseIds(item!)).toMatchSnapshot();
  });

  it("should handle existing document type", async () => {
    const docTypeModel: CreateDocumentTypeModel = {
      name: EXISTING_DOCTYPE_NAME,
      alias: EXISTING_DOCTYPE_NAME.toLowerCase().replace(/\s+/g, ''),
      icon: "icon-document",
      allowedAsRoot: false,
      compositions: [],
      allowedDocumentTypes: [],
      properties: []
    };

    // First create the document type
    await CreateDocumentTypeTool.handler(docTypeModel as any, createMockRequestHandlerExtra());

    // Try to create it again
    const result = await CreateDocumentTypeTool.handler(docTypeModel as any, createMockRequestHandlerExtra());

    // Verify the error response using snapshot
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should create a document type with properties", async () => {
    // Create a more complex document type with properties
    const docTypeModel: CreateDocumentTypeModel = {
      name: TEST_DOCTYPE_NAME,
      alias: TEST_DOCTYPE_NAME.toLowerCase().replace(/\s+/g, ''),
      icon: "icon-document",
      allowedAsRoot: false,
      compositions: [],
      allowedDocumentTypes: [],
      properties: [
        {
          name: "Property 1",
          alias: "property1",
          dataTypeId: TextString_DATA_TYPE_ID,
          tab: "Tab 1",
          group: "Group 1"
        }
      ]
    };

    const result = await CreateDocumentTypeTool.handler(docTypeModel as any, createMockRequestHandlerExtra());

    // Extract ID for normalization
    const responseData = validateStructuredContent(result, createDocumentTypeOutputSchema);
    const documentTypeId = responseData.id;

    // Verify the handler response using snapshot
    expect(responseData.message).toBe("Document type created successfully");
    expect(createSnapshotResult(result, documentTypeId)).toMatchSnapshot();

    const item = await DocumentTypeTestHelper.findDocumentType(TEST_DOCTYPE_NAME);
    expect(item).toBeDefined();
    expect(DocumentTypeTestHelper.normaliseIds(item!)).toMatchSnapshot();
  });

  it("should create a document type with parent folder", async () => {
    // Arrange: Create parent folder
    const folderBuilder = await new DocumentTypeFolderBuilder(TEST_FOLDER_NAME)
      .create();

    // Arrange: Create document type with flattened parentId for tool
    const docTypeModel: CreateDocumentTypeModel = {
      name: TEST_DOCTYPE_WITH_PARENT_NAME,
      alias: TEST_DOCTYPE_WITH_PARENT_NAME.toLowerCase().replace(/\s+/g, ''),
      description: "Test document type in folder",
      icon: "icon-document",
      allowedAsRoot: false,
      compositions: [],
      allowedDocumentTypes: [],
      properties: [],
      parentId: folderBuilder.getId()  // Flattened parent ID
    };

    // Act: Create the document type
    const result = await CreateDocumentTypeTool.handler(docTypeModel as any, createMockRequestHandlerExtra());

    // Extract ID for normalization
    const responseData = validateStructuredContent(result, createDocumentTypeOutputSchema);
    const documentTypeId = responseData.id;

    // Assert: Verify response
    expect(createSnapshotResult(result, documentTypeId)).toMatchSnapshot();

    // Assert: Verify the created item exists with correct parent
    const item = await DocumentTypeTestHelper.findDocumentType(TEST_DOCTYPE_WITH_PARENT_NAME);
    expect(item).toBeDefined();
    expect(item!.parent!.id).toBe(folderBuilder.getId());

    // Normalize both the item ID and parent ID for snapshot
    const normalizedItem = DocumentTypeTestHelper.normaliseIds(item!) as DocumentTypeTreeItemResponseModel;
    if (normalizedItem.parent) {
      normalizedItem.parent.id = "00000000-0000-0000-0000-000000000000";
    }
    expect(normalizedItem).toMatchSnapshot();
  });

  it("should reject property without tab or group", async () => {
    const docTypeModel: CreateDocumentTypeModel = {
      name: TEST_DOCTYPE_NAME,
      alias: TEST_DOCTYPE_NAME.toLowerCase().replace(/\s+/g, ''),
      icon: "icon-document",
      allowedAsRoot: false,
      compositions: [],
      allowedDocumentTypes: [],
      properties: [
        {
          name: "Bad Property",
          alias: "badProperty",
          dataTypeId: TextString_DATA_TYPE_ID,
          // Missing both tab and group
        } as any // Need to bypass TypeScript to test runtime validation
      ]
    };

    // The zod schema validation should fail and return an error result
    const result = await CreateDocumentTypeTool.handler(docTypeModel as any, createMockRequestHandlerExtra());
    expect(result.isError).toBe(true);
  });

  it("should create separate groups for same group name in different tabs", async () => {
    const docTypeModel: CreateDocumentTypeModel = {
      name: TEST_DOCTYPE_NAME,
      alias: TEST_DOCTYPE_NAME.toLowerCase().replace(/\s+/g, ''),
      icon: "icon-document",
      allowedAsRoot: false,
      compositions: [],
      allowedDocumentTypes: [],
      properties: [
        {
          name: "Prop1",
          alias: "prop1",
          dataTypeId: TextString_DATA_TYPE_ID,
          tab: "Tab1",
          group: "Settings"
        },
        {
          name: "Prop2",
          alias: "prop2",
          dataTypeId: TextString_DATA_TYPE_ID,
          tab: "Tab2",
          group: "Settings"
        }
      ]
    };

    const result = await CreateDocumentTypeTool.handler(docTypeModel as any, createMockRequestHandlerExtra());

    const responseData = validateStructuredContent(result, createDocumentTypeOutputSchema);
    const fullDocType = await DocumentTypeTestHelper.getFullDocumentType(responseData.id);

    // Should have 2 tabs
    const tabs = fullDocType.containers.filter(c => c.type === "Tab");
    expect(tabs).toHaveLength(2);

    // Should have 2 separate "Settings" groups
    const groups = fullDocType.containers.filter(c => c.type === "Group" && c.name === "Settings");
    expect(groups).toHaveLength(2);

    // Each group should be parented to different tab
    expect(groups[0].parent?.id).not.toBe(groups[1].parent?.id);

    // Properties should reference different groups
    expect(fullDocType.properties[0].container?.id).not.toBe(fullDocType.properties[1].container?.id);

    // Verify with snapshot
    const normalized = DocumentTypeTestHelper.normaliseFullDocumentType(fullDocType);
    expect(normalized).toMatchSnapshot();
  });

});