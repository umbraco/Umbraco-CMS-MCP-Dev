import UpdateDocumentPropertiesTool from "../put/update-document-properties.js";
import CreateDocumentTool from "../post/create-document.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { LanguageBuilder } from "../../language/__tests__/helpers/language-builder.js";
import { jest } from "@jest/globals";
import {
  ROOT_DOCUMENT_TYPE_ID,
  BLANK_UUID,
  TextString_DATA_TYPE_ID,
} from "../../../../constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("update-document-properties", () => {
  const TEST_DOCUMENT_NAME = "_Test Document Properties";
  const INITIAL_TITLE = "_Initial Title";
  const UPDATED_TITLE = "_Updated Title";
  const SECOND_PROPERTY_VALUE = "_Second Property Value";
  const INVALID_ALIAS = "nonExistentProperty";

  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Clean up any test documents
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    console.error = originalConsoleError;
  });

  it("should update single property value", async () => {
    // Arrange - Create a document with an initial title property
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .withValue("title", INITIAL_TITLE)
      .create();

    // Act - Update the title property
    const result = await UpdateDocumentPropertiesTool().handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: "title",
            value: UPDATED_TITLE,
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    // Assert - Verify the handler response with normalized IDs and dates
    const normalizedResult = createSnapshotResult(result, builder.getId());
    expect(normalizedResult).toMatchSnapshot();

    // Verify the property was actually updated
    const client = UmbracoManagementClient.getClient();
    const updatedDocument = await client.getDocumentById(builder.getId());
    const titleValue = updatedDocument.values.find((v) => v.alias === "title");
    expect(titleValue?.value).toBe(UPDATED_TITLE);
  });

  it("should update property value twice", async () => {
    // Arrange - Create a document with an initial title property
    const SECOND_UPDATED_TITLE = "_Second Updated Title";
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .withValue("title", INITIAL_TITLE)
      .create();

    // Act - Update the title property once
    await UpdateDocumentPropertiesTool().handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: "title",
            value: UPDATED_TITLE,
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    // Act - Update the title property again to a different value
    const result = await UpdateDocumentPropertiesTool().handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: "title",
            value: SECOND_UPDATED_TITLE,
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    // Assert - Verify the handler response with normalized IDs and dates
    const normalizedResult = createSnapshotResult(result, builder.getId());
    expect(normalizedResult).toMatchSnapshot();

    // Verify the property was updated to the second value
    const client = UmbracoManagementClient.getClient();
    const updatedDocument = await client.getDocumentById(builder.getId());
    const titleValue = updatedDocument.values.find((v) => v.alias === "title");
    expect(titleValue?.value).toBe(SECOND_UPDATED_TITLE);
  });

  it("should return error on invalid alias", async () => {
    // Arrange - Create a document with a title property
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .withValue("title", INITIAL_TITLE)
      .create();

    // Act - Try to update with a non-existent property alias
    const result = await UpdateDocumentPropertiesTool().handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: INVALID_ALIAS,
            value: "Some Value",
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    // Assert - Verify error response includes invalidAliases and availableAliases
    expect(result).toMatchSnapshot();

    // Verify the error content structure
    const content = result.content[0];
    expect(content.type).toBe("text");
    if (content.type === "text") {
      const responseData = JSON.parse(content.text);
      expect(responseData.success).toBe(false);
      expect(responseData.invalidAliases).toContain(INVALID_ALIAS);
      expect(Array.isArray(responseData.availableAliases)).toBe(true);
      expect(responseData.availableAliases.length).toBeGreaterThan(0);
    }
  });

  it("should handle non-existent document", async () => {
    // Act - Try to update properties on a document that doesn't exist
    const result = await UpdateDocumentPropertiesTool().handler(
      {
        id: BLANK_UUID,
        properties: [
          {
            alias: "title",
            value: UPDATED_TITLE,
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    // Assert - Verify the error response
    expect(result).toMatchSnapshot();
  });

  it("should update property and preserve initial value", async () => {
    // Arrange - Create a document with a title property
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .withValue("title", INITIAL_TITLE)
      .create();

    // Get the initial document state to verify it exists
    const client = UmbracoManagementClient.getClient();
    const initialDocument = await client.getDocumentById(builder.getId());
    const initialTitle = initialDocument.values.find(
      (v) => v.alias === "title"
    );
    expect(initialTitle?.value).toBe(INITIAL_TITLE);

    // Act - Update the title property to a new value
    const result = await UpdateDocumentPropertiesTool().handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: "title",
            value: UPDATED_TITLE,
          },
        ],
      },
      { signal: new AbortController().signal }
    );

    // Assert - Verify the handler response with normalized IDs and dates
    const normalizedResult = createSnapshotResult(result, builder.getId());
    expect(normalizedResult).toMatchSnapshot();

    // Verify the title was updated from the initial value
    const updatedDocument = await client.getDocumentById(builder.getId());
    const titleValue = updatedDocument.values.find((v) => v.alias === "title");

    expect(titleValue?.value).toBe(UPDATED_TITLE);
    expect(titleValue?.value).not.toBe(INITIAL_TITLE);
  });

  describe("multi-culture support", () => {
    const MULTI_CULTURE_DOC_NAME = "_Test Multi-Culture Document";
    const MULTI_CULTURE_DOC_TYPE_NAME = "_Test Multi-Culture DocType";
    const EN_US_TITLE = "_English Title";
    const DA_DK_TITLE = "_Danish Title";
    const UPDATED_EN_TITLE = "_Updated English Title";
    const UPDATED_DA_TITLE = "_Updated Danish Title";

    // Track builders for cleanup
    let languageBuilder: LanguageBuilder | null = null;
    let docTypeBuilder: DocumentTypeBuilder | null = null;

    afterEach(async () => {
      // Clean up test documents first (before document type)
      await DocumentTestHelper.cleanup(MULTI_CULTURE_DOC_NAME);

      // Clean up document type
      if (docTypeBuilder) {
        await DocumentTypeTestHelper.cleanup(MULTI_CULTURE_DOC_TYPE_NAME);
        docTypeBuilder = null;
      }

      // Clean up language if created
      if (languageBuilder) {
        await languageBuilder.cleanup();
        languageBuilder = null;
      }
    });

    /**
     * Helper to ensure da-DK language exists
     */
    async function ensureDanishLanguage(): Promise<void> {
      const client = UmbracoManagementClient.getClient();
      const languagesResponse = await client.getLanguage({});
      const hasDaDK = languagesResponse.items.some(
        (lang) => lang.isoCode === "da-DK"
      );

      if (!hasDaDK) {
        languageBuilder = await new LanguageBuilder()
          .withName("Danish (Denmark)")
          .withIsoCode("da-DK")
          .withIsDefault(false)
          .withIsMandatory(false)
          .withFallbackIsoCode(null)
          .create();
      }
    }

    /**
     * Helper to create a multi-culture document type with a culture-varying title property
     */
    async function createMultiCultureDocType(): Promise<string> {
      docTypeBuilder = await new DocumentTypeBuilder()
        .withName(MULTI_CULTURE_DOC_TYPE_NAME)
        .allowAsRoot(true)
        .variesByCulture(true)
        .withProperty("title", "Title", TextString_DATA_TYPE_ID, {
          variesByCulture: true,
        })
        .create();

      return docTypeBuilder.getId();
    }

    it("should update property for specific culture", async () => {
      const client = UmbracoManagementClient.getClient();

      // Arrange - Ensure da-DK language exists
      await ensureDanishLanguage();

      // Create a multi-culture document type
      const docTypeId = await createMultiCultureDocType();

      // Create a multi-culture document with culture-specific title values
      const createResult = await CreateDocumentTool().handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US", "da-DK"],
          values: [
            { editorAlias: "Umbraco.TextBox", alias: "title", value: EN_US_TITLE, culture: "en-US", segment: null },
            { editorAlias: "Umbraco.TextBox", alias: "title", value: DA_DK_TITLE, culture: "da-DK", segment: null },
          ],
        },
        { signal: new AbortController().signal }
      );

      // Extract the document ID from the creation response
      const createContent = createResult.content[0];
      if (createContent.type !== "text") {
        throw new Error("Unexpected response type from CreateDocumentTool");
      }
      const createResponse = JSON.parse(createContent.text);
      if (!createResponse.id) {
        throw new Error(`Failed to create multi-culture document: ${createContent.text}`);
      }
      const documentId = createResponse.id;

      // Act - Update only the English title
      const result = await UpdateDocumentPropertiesTool().handler(
        {
          id: documentId,
          properties: [
            {
              alias: "title",
              value: UPDATED_EN_TITLE,
              culture: "en-US",
            },
          ],
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify success
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(true);
      }

      // Verify only English title was updated, Danish remains unchanged
      const updatedDocument = await client.getDocumentById(documentId);
      const enTitle = updatedDocument.values.find(
        (v) => v.alias === "title" && v.culture === "en-US"
      );
      const daTitle = updatedDocument.values.find(
        (v) => v.alias === "title" && v.culture === "da-DK"
      );

      expect(enTitle?.value).toBe(UPDATED_EN_TITLE);
      expect(daTitle?.value).toBe(DA_DK_TITLE); // Should be unchanged
    });

    it("should update same property in multiple cultures simultaneously", async () => {
      const client = UmbracoManagementClient.getClient();

      // Arrange - Ensure da-DK language exists
      await ensureDanishLanguage();

      // Create a multi-culture document type
      const docTypeId = await createMultiCultureDocType();

      // Create a multi-culture document with culture-specific values
      const createResult = await CreateDocumentTool().handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US", "da-DK"],
          values: [
            { editorAlias: "Umbraco.TextBox", alias: "title", value: EN_US_TITLE, culture: "en-US", segment: null },
            { editorAlias: "Umbraco.TextBox", alias: "title", value: DA_DK_TITLE, culture: "da-DK", segment: null },
          ],
        },
        { signal: new AbortController().signal }
      );

      // Extract the document ID from the creation response
      const createContent = createResult.content[0];
      if (createContent.type !== "text") {
        throw new Error("Unexpected response type from CreateDocumentTool");
      }
      const createResponse = JSON.parse(createContent.text);
      if (!createResponse.id) {
        throw new Error(`Failed to create multi-culture document: ${createContent.text}`);
      }
      const documentId = createResponse.id;

      // Act - Update both culture titles in a single call
      const result = await UpdateDocumentPropertiesTool().handler(
        {
          id: documentId,
          properties: [
            {
              alias: "title",
              value: UPDATED_EN_TITLE,
              culture: "en-US",
            },
            {
              alias: "title",
              value: UPDATED_DA_TITLE,
              culture: "da-DK",
            },
          ],
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify success
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(true);
        expect(responseData.updatedProperties).toHaveLength(2);
      }

      // Verify both titles were updated
      const updatedDocument = await client.getDocumentById(documentId);
      const enTitle = updatedDocument.values.find(
        (v) => v.alias === "title" && v.culture === "en-US"
      );
      const daTitle = updatedDocument.values.find(
        (v) => v.alias === "title" && v.culture === "da-DK"
      );

      expect(enTitle?.value).toBe(UPDATED_EN_TITLE);
      expect(daTitle?.value).toBe(UPDATED_DA_TITLE);
    });

    it("should return error when culture does not exist on document", async () => {
      // Arrange - Ensure da-DK language exists for the test
      await ensureDanishLanguage();

      // Create a multi-culture document type
      const docTypeId = await createMultiCultureDocType();

      // Create a document with only English culture (no Danish)
      const createResult = await CreateDocumentTool().handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US"], // Only English - no Danish
          values: [
            { editorAlias: "Umbraco.TextBox", alias: "title", value: EN_US_TITLE, culture: "en-US", segment: null },
          ],
        },
        { signal: new AbortController().signal }
      );

      // Extract the document ID from the creation response
      const createContent = createResult.content[0];
      if (createContent.type !== "text") {
        throw new Error("Unexpected response type from CreateDocumentTool");
      }
      const createResponse = JSON.parse(createContent.text);
      if (!createResponse.id) {
        throw new Error(`Failed to create document: ${createContent.text}`);
      }
      const documentId = createResponse.id;

      // Act - Try to update a Danish property that doesn't exist on this document
      const result = await UpdateDocumentPropertiesTool().handler(
        {
          id: documentId,
          properties: [
            {
              alias: "title",
              value: UPDATED_DA_TITLE,
              culture: "da-DK", // This culture doesn't exist on the document
            },
          ],
        },
        { signal: new AbortController().signal }
      );

      // Assert - Should return error with invalid aliases
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(false);
        expect(responseData.invalidAliases).toBeDefined();
        expect(responseData.invalidAliases.length).toBeGreaterThan(0);
        // Should mention the culture in the error
        expect(responseData.invalidAliases[0]).toContain("da-DK");
      }
    });
  });
});
