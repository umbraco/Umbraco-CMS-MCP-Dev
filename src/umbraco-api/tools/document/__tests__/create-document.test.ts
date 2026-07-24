import CreateDocumentTool from "../post/create-document.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { ROOT_DOCUMENT_TYPE_ID } from "../../../../constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeObject,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { TemplateBuilder } from "../../template/__tests__/helpers/template-builder.js";
import { TemplateTestHelper } from "../../template/__tests__/helpers/template-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";

const TEST_DOCUMENT_NAME = "_Test Document Created";
const TEST_TEMPLATE_NAME = "_Test Default Template";
const TEST_DOC_TYPE_NAME = "_Test Doc Type With Templates";

describe("create-document", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_NAME);
    await TemplateTestHelper.cleanup(TEST_TEMPLATE_NAME);
  });

  it("should create a document", async () => {
    // Create document model
    const docModel = {
      documentTypeId: ROOT_DOCUMENT_TYPE_ID,
      name: TEST_DOCUMENT_NAME,
      parentId: undefined,
      templateId: undefined,
      cultures: undefined,
      values: [],
    };

    // Create the document
    const result = await CreateDocumentTool.handler(docModel, createMockRequestHandlerExtra());

    // Validate and extract response
    const responseData = validateToolResponse(CreateDocumentTool, result);
    const documentId = responseData.id;

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result, documentId)).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(item).toBeDefined();
    const norm = {
      ...normalizeObject(item!),
      createDate: "NORMALIZED_DATE",
    };
    expect(norm).toMatchSnapshot();
  });

  it("should create a document with additional properties", async () => {
    // Create a more complex document with additional values
    const docModel = {
      documentTypeId: ROOT_DOCUMENT_TYPE_ID,
      name: TEST_DOCUMENT_NAME,
      parentId: undefined,
      templateId: undefined,
      cultures: undefined,
      values: [
        {
          editorAlias: "Umbraco.TextBox",
          culture: null,
          segment: null,
          alias: "title",
          value: "Test Value",
        },
      ],
    };

    const result = await CreateDocumentTool.handler(docModel, createMockRequestHandlerExtra());

    // Validate and extract response
    const responseData = validateToolResponse(CreateDocumentTool, result);
    const documentId = responseData.id;

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result, documentId)).toMatchSnapshot();

    const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(item).toBeDefined();
    const norm = {
      ...normalizeObject(item!),
      createDate: "NORMALIZED_DATE",
    };
    expect(norm).toMatchSnapshot();
  });

  it("should create a document with specific cultures", async () => {
    const client = UmbracoManagementClient.getClient();

    // Track what we need to restore after the test
    let createdLanguage = false;
    let originalVariesByCulture = false;

    try {
      // Verify da-DK language exists, if not create it
      const languagesResponse = await client.getLanguage({});
      const hasDaDK = languagesResponse.items.some(lang => lang.isoCode === "da-DK");

      if (!hasDaDK) {
        console.log("Creating da-DK language as it doesn't exist");
        await client.postLanguage({
          name: "Danish (Denmark)",
          isoCode: "da-DK",
          fallbackIsoCode: null,
          isDefault: false,
          isMandatory: false
        });
        createdLanguage = true;
      }

      // Verify root document type allows multiple cultures
      const rootDocType = await client.getDocumentTypeById(ROOT_DOCUMENT_TYPE_ID);
      originalVariesByCulture = rootDocType.variesByCulture ?? false;

      if (rootDocType.allowedAsRoot && rootDocType.variesByCulture === false) {
        console.log("Updating root document type to allow culture variation");
        await client.putDocumentTypeById(ROOT_DOCUMENT_TYPE_ID, {
          ...rootDocType,
          variesByCulture: true
        });
      }

      // Create document with specific cultures
      const docModel = {
        documentTypeId: ROOT_DOCUMENT_TYPE_ID,
        name: TEST_DOCUMENT_NAME,
        parentId: undefined,
        templateId: undefined,
        cultures: ["en-US", "da-DK"],
        values: [],
      };

      const result = await CreateDocumentTool.handler(docModel, createMockRequestHandlerExtra());

      // Validate and extract response
      const responseData = validateToolResponse(CreateDocumentTool, result);
      const documentId = responseData.id;

      // Verify the handler response using snapshot
      expect(createSnapshotResult(result, documentId)).toMatchSnapshot();

      const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
      expect(item).toBeDefined();
      // Should have variants for both cultures
      expect(item!.variants).toHaveLength(2);
      const itemCultures = item!.variants.map(v => v.culture).sort();
      expect(itemCultures).toEqual(["da-DK", "en-US"]);
    } finally {
      // Restore original configuration to avoid affecting other tests

      // Restore document type configuration if we changed it
      if (originalVariesByCulture === false) {
        try {
          const rootDocType = await client.getDocumentTypeById(ROOT_DOCUMENT_TYPE_ID);
          await client.putDocumentTypeById(ROOT_DOCUMENT_TYPE_ID, {
            ...rootDocType,
            variesByCulture: false
          });
          console.log("Restored root document type variesByCulture to false");
        } catch (error) {
          console.log("Error restoring document type configuration:", error);
        }
      }

      // Delete the language if we created it
      if (createdLanguage) {
        try {
          await client.deleteLanguageByIsoCode("da-DK");
          console.log("Deleted da-DK language created for test");
        } catch (error) {
          console.log("Error deleting da-DK language:", error);
        }
      }
    }
  });

  it("should create a document with empty cultures array (null culture)", async () => {
    // Create document with empty cultures array - should behave like original (null culture)
    const docModel = {
      documentTypeId: ROOT_DOCUMENT_TYPE_ID,
      name: TEST_DOCUMENT_NAME,
      parentId: undefined,
      templateId: undefined,
      cultures: [],
      values: [],
    };

    const result = await CreateDocumentTool.handler(docModel, createMockRequestHandlerExtra());

    // Validate and extract response
    const responseData = validateToolResponse(CreateDocumentTool, result);
    const documentId = responseData.id;

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result, documentId)).toMatchSnapshot();

    const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(item).toBeDefined();
    // Should have single variant with null culture (original behavior)
    expect(item!.variants).toHaveLength(1);
    expect(item!.variants[0].culture).toBeNull();
  });

  it("should apply an explicit templateId when provided", async () => {
    // Arrange: create a template and a doc type that allows it (no default).
    const template = await new TemplateBuilder()
      .withName(TEST_TEMPLATE_NAME)
      .create();
    const templateId = template.getId();

    const docType = await new DocumentTypeBuilder()
      .withName(TEST_DOC_TYPE_NAME)
      .allowAsRoot(true)
      .withAllowedTemplate(templateId)
      .create();
    const docTypeId = docType.getId();

    // Act: create a document with an explicit templateId.
    const result = await CreateDocumentTool.handler(
      {
        documentTypeId: docTypeId,
        name: TEST_DOCUMENT_NAME,
        parentId: undefined,
        templateId,
        cultures: undefined,
        values: [],
      },
      createMockRequestHandlerExtra()
    );

    // Assert: handler succeeds, document carries the requested template.
    const responseData = validateToolResponse(CreateDocumentTool, result);
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    // Verify the created document has the correct template assigned
    const client = UmbracoManagementClient.getClient();
    const document = await client.getDocumentById(responseData.id);
    expect(document).toBeDefined();
    expect(document.template?.id).toBe(templateId);
  });

  it("should auto-apply the document type's default template when templateId is omitted", async () => {
    // Arrange: create a template and a doc type that uses it as default.
    const template = await new TemplateBuilder()
      .withName(TEST_TEMPLATE_NAME)
      .create();
    const templateId = template.getId();

    const docType = await new DocumentTypeBuilder()
      .withName(TEST_DOC_TYPE_NAME)
      .allowAsRoot(true)
      .withAllowedTemplate(templateId)
      .withDefaultTemplate(templateId)
      .create();
    const docTypeId = docType.getId();

    // Act: create a document WITHOUT specifying templateId.
    const result = await CreateDocumentTool.handler(
      {
        documentTypeId: docTypeId,
        name: TEST_DOCUMENT_NAME,
        parentId: undefined,
        templateId: undefined,
        cultures: undefined,
        values: [],
      },
      createMockRequestHandlerExtra()
    );

    // Assert: the default template was attached.
    const responseData = validateToolResponse(CreateDocumentTool, result);
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    const client = UmbracoManagementClient.getClient();
    const document = await client.getDocumentById(responseData.id);
    expect(document).toBeDefined();
    expect(document.template?.id).toBe(templateId);
  });

  it("should create the document with no template when the doc type has no default", async () => {
    // Arrange: a doc type with no templates configured at all.
    const docType = await new DocumentTypeBuilder()
      .withName(TEST_DOC_TYPE_NAME)
      .allowAsRoot(true)
      .create();
    const docTypeId = docType.getId();

    // Act: create the document without specifying a templateId.
    const result = await CreateDocumentTool.handler(
      {
        documentTypeId: docTypeId,
        name: TEST_DOCUMENT_NAME,
        parentId: undefined,
        templateId: undefined,
        cultures: undefined,
        values: [],
      },
      createMockRequestHandlerExtra()
    );

    // Assert: creation still succeeds; template is null on the document.
    const responseData = validateToolResponse(CreateDocumentTool, result);
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    const client = UmbracoManagementClient.getClient();
    const document = await client.getDocumentById(responseData.id);
    expect(document).toBeDefined();
    expect(document.template).toBeNull();
  });
});
