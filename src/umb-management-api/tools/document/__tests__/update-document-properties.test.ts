import UpdateDocumentPropertiesTool from "../put/update-document-properties.js";
import CreateDocumentTool, { createOutputSchema } from "../post/create-document.js";
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
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";

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
    const result = await UpdateDocumentPropertiesTool.handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: "title",
            value: UPDATED_TITLE,
          },
        ],
      },
      createMockRequestHandlerExtra()
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
    await UpdateDocumentPropertiesTool.handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: "title",
            value: UPDATED_TITLE,
          },
        ],
      },
      createMockRequestHandlerExtra()
    );

    // Act - Update the title property again to a different value
    const result = await UpdateDocumentPropertiesTool.handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: "title",
            value: SECOND_UPDATED_TITLE,
          },
        ],
      },
      createMockRequestHandlerExtra()
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
    const result = await UpdateDocumentPropertiesTool.handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: INVALID_ALIAS,
            value: "Some Value",
          },
        ],
      },
      createMockRequestHandlerExtra()
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
      expect(Array.isArray(responseData.availableProperties)).toBe(true);
      expect(responseData.availableProperties.length).toBeGreaterThan(0);
    }
  });

  it("should handle non-existent document", async () => {
    // Act - Try to update properties on a document that doesn't exist
    const result = await UpdateDocumentPropertiesTool.handler(
      {
        id: BLANK_UUID,
        properties: [
          {
            alias: "title",
            value: UPDATED_TITLE,
          },
        ],
      },
      createMockRequestHandlerExtra()
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
    const result = await UpdateDocumentPropertiesTool.handler(
      {
        id: builder.getId(),
        properties: [
          {
            alias: "title",
            value: UPDATED_TITLE,
          },
        ],
      },
      createMockRequestHandlerExtra()
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

    beforeEach(async () => {
      // Clean up any leftover test data from previous runs
      await DocumentTestHelper.cleanup(MULTI_CULTURE_DOC_NAME);
      await DocumentTypeTestHelper.cleanup(MULTI_CULTURE_DOC_TYPE_NAME);
    });

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
      const createResult = await CreateDocumentTool.handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US", "da-DK"],
          values: [
            { editorAlias: "Umbraco.TextBox", alias: "title", value: EN_US_TITLE, culture: "en-US", segment: null },
            { editorAlias: "Umbraco.TextBox", alias: "title", value: DA_DK_TITLE, culture: "da-DK", segment: null },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Extract the document ID from the creation response
      const createResponse = validateStructuredContent(createResult, createOutputSchema);
      const documentId = createResponse.id;

      // Act - Update only the English title
      const result = await UpdateDocumentPropertiesTool.handler(
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
        createMockRequestHandlerExtra()
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
      const createResult = await CreateDocumentTool.handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US", "da-DK"],
          values: [
            { editorAlias: "Umbraco.TextBox", alias: "title", value: EN_US_TITLE, culture: "en-US", segment: null },
            { editorAlias: "Umbraco.TextBox", alias: "title", value: DA_DK_TITLE, culture: "da-DK", segment: null },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Extract the document ID from the creation response
      const createResponse = validateStructuredContent(createResult, createOutputSchema);
      const documentId = createResponse.id;

      // Act - Update both culture titles in a single call
      const result = await UpdateDocumentPropertiesTool.handler(
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
        createMockRequestHandlerExtra()
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

    it("should add culture variant property when culture does not exist on document", async () => {
      const client = UmbracoManagementClient.getClient();

      // Arrange - Ensure da-DK language exists for the test
      await ensureDanishLanguage();

      // Create a multi-culture document type
      const docTypeId = await createMultiCultureDocType();

      // Create a document with only English culture (no Danish)
      const createResult = await CreateDocumentTool.handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US"], // Only English - no Danish
          values: [
            { editorAlias: "Umbraco.TextBox", alias: "title", value: EN_US_TITLE, culture: "en-US", segment: null },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Extract the document ID from the creation response
      const createResponse = validateStructuredContent(createResult, createOutputSchema);
      const documentId = createResponse.id;

      // Act - Add the Danish title property (didn't exist on document before but exists on doc type)
      const result = await UpdateDocumentPropertiesTool.handler(
        {
          id: documentId,
          properties: [
            {
              alias: "title",
              value: UPDATED_DA_TITLE,
              culture: "da-DK", // This culture didn't exist on the document but property exists on doc type
            },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Should succeed because property exists on document type
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(true);
        expect(responseData.addedProperties).toContain("title[da-DK]");
      }

      // Verify the Danish title was added
      const updatedDocument = await client.getDocumentById(documentId);
      const daTitle = updatedDocument.values.find(
        (v) => v.alias === "title" && v.culture === "da-DK"
      );
      expect(daTitle?.value).toBe(UPDATED_DA_TITLE);
    });
  });

  describe("add new properties", () => {
    const ADD_PROPS_DOC_NAME = "_Test Add Properties Document";
    const ADD_PROPS_DOC_TYPE_NAME = "_Test Add Properties DocType";
    const COMPOSITION_DOC_TYPE_NAME = "_Test Composition DocType";
    const AUTHOR_VALUE = "_Test Author";
    const SUBTITLE_VALUE = "_Test Subtitle";

    // Track builders for cleanup
    let docTypeBuilder: DocumentTypeBuilder | null = null;
    let compositionBuilder: DocumentTypeBuilder | null = null;

    beforeEach(async () => {
      // Clean up any leftover test data from previous runs
      await DocumentTestHelper.cleanup(ADD_PROPS_DOC_NAME);
      await DocumentTypeTestHelper.cleanup(ADD_PROPS_DOC_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(COMPOSITION_DOC_TYPE_NAME);
    });

    afterEach(async () => {
      // Clean up test documents first (before document type)
      await DocumentTestHelper.cleanup(ADD_PROPS_DOC_NAME);

      // Clean up document type (must come before composition)
      if (docTypeBuilder) {
        await DocumentTypeTestHelper.cleanup(ADD_PROPS_DOC_TYPE_NAME);
        docTypeBuilder = null;
      }

      // Clean up composition document type
      if (compositionBuilder) {
        await DocumentTypeTestHelper.cleanup(COMPOSITION_DOC_TYPE_NAME);
        compositionBuilder = null;
      }
    });

    it("should add new property that exists on document type but not on document", async () => {
      const client = UmbracoManagementClient.getClient();

      // Arrange - Create document type with a property
      docTypeBuilder = await new DocumentTypeBuilder()
        .withName(ADD_PROPS_DOC_TYPE_NAME)
        .allowAsRoot(true)
        .withProperty("author", "Author", TextString_DATA_TYPE_ID)
        .create();

      // Create document without any initial values
      const docBuilder = await new DocumentBuilder()
        .withName(ADD_PROPS_DOC_NAME)
        .withDocumentType(docTypeBuilder.getId())
        .create();

      const documentId = docBuilder.getId();

      // Verify the document has no values initially
      const initialDoc = await client.getDocumentById(documentId);
      expect(initialDoc.values).toHaveLength(0);

      // Act - Add the author property
      const result = await UpdateDocumentPropertiesTool.handler(
        {
          id: documentId,
          properties: [
            {
              alias: "author",
              value: AUTHOR_VALUE,
            },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Should succeed with property added
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(true);
        expect(responseData.addedProperties).toContain("author");
      }

      // Verify the author was added
      const updatedDocument = await client.getDocumentById(documentId);
      const authorValue = updatedDocument.values.find((v) => v.alias === "author");
      expect(authorValue?.value).toBe(AUTHOR_VALUE);
    });

    it("should add property from composition", async () => {
      const client = UmbracoManagementClient.getClient();

      // Arrange - Create composition with subtitle property
      compositionBuilder = await new DocumentTypeBuilder()
        .withName(COMPOSITION_DOC_TYPE_NAME)
        .withProperty("subtitle", "Subtitle", TextString_DATA_TYPE_ID)
        .create();

      // Create main document type that uses the composition
      docTypeBuilder = await new DocumentTypeBuilder()
        .withName(ADD_PROPS_DOC_TYPE_NAME)
        .allowAsRoot(true)
        .withComposition(compositionBuilder.getId())
        .create();

      // Create document without any values (subtitle from composition not set)
      const docBuilder = await new DocumentBuilder()
        .withName(ADD_PROPS_DOC_NAME)
        .withDocumentType(docTypeBuilder.getId())
        .create();

      const documentId = docBuilder.getId();

      // Act - Add the subtitle property from composition
      const result = await UpdateDocumentPropertiesTool.handler(
        {
          id: documentId,
          properties: [
            {
              alias: "subtitle",
              value: SUBTITLE_VALUE,
            },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Should succeed with property added
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(true);
        expect(responseData.addedProperties).toContain("subtitle");
      }

      // Verify the subtitle was added
      const updatedDocument = await client.getDocumentById(documentId);
      const subtitleValue = updatedDocument.values.find((v) => v.alias === "subtitle");
      expect(subtitleValue?.value).toBe(SUBTITLE_VALUE);
    });

    it("should mix update and add in single call", async () => {
      const client = UmbracoManagementClient.getClient();

      // Arrange - Create composition with author property (to avoid the container bug)
      compositionBuilder = await new DocumentTypeBuilder()
        .withName(COMPOSITION_DOC_TYPE_NAME)
        .withProperty("author", "Author", TextString_DATA_TYPE_ID)
        .create();

      // Create main document type with title and composition
      docTypeBuilder = await new DocumentTypeBuilder()
        .withName(ADD_PROPS_DOC_TYPE_NAME)
        .allowAsRoot(true)
        .withProperty("title", "Title", TextString_DATA_TYPE_ID)
        .withComposition(compositionBuilder.getId())
        .create();

      // Create document with only title set
      const docBuilder = await new DocumentBuilder()
        .withName(ADD_PROPS_DOC_NAME)
        .withDocumentType(docTypeBuilder.getId())
        .withValue("title", "_Initial Title")
        .create();

      const documentId = docBuilder.getId();

      // Act - Update title AND add author in single call
      const result = await UpdateDocumentPropertiesTool.handler(
        {
          id: documentId,
          properties: [
            { alias: "title", value: "_Updated Title" },
            { alias: "author", value: AUTHOR_VALUE },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Should succeed with both updated and added
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(true);
        expect(responseData.updatedProperties).toContain("title");
        expect(responseData.addedProperties).toContain("author");
        expect(responseData.message).toContain("updated 1");
        expect(responseData.message).toContain("added 1");
      }

      // Verify both properties
      const updatedDocument = await client.getDocumentById(documentId);
      const titleValue = updatedDocument.values.find((v) => v.alias === "title");
      const authorValue = updatedDocument.values.find((v) => v.alias === "author");
      expect(titleValue?.value).toBe("_Updated Title");
      expect(authorValue?.value).toBe(AUTHOR_VALUE);
    });

    it("should return error when adding invariant property with culture", async () => {
      // Arrange - Create document type with invariant property
      docTypeBuilder = await new DocumentTypeBuilder()
        .withName(ADD_PROPS_DOC_TYPE_NAME)
        .allowAsRoot(true)
        .withProperty("author", "Author", TextString_DATA_TYPE_ID, { variesByCulture: false })
        .create();

      // Create document without any values
      const docBuilder = await new DocumentBuilder()
        .withName(ADD_PROPS_DOC_NAME)
        .withDocumentType(docTypeBuilder.getId())
        .create();

      const documentId = docBuilder.getId();

      // Act - Try to add author with a culture (should fail - invariant property)
      const result = await UpdateDocumentPropertiesTool.handler(
        {
          id: documentId,
          properties: [
            {
              alias: "author",
              value: AUTHOR_VALUE,
              culture: "en-US", // Shouldn't have culture for invariant property
            },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Should fail with variance error
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toBe("Culture/segment validation failed");
        expect(responseData.message).toContain("author");
        expect(responseData.message).toContain("does not vary by culture");
      }
    });

    it("should return error when adding culture-variant property without culture", async () => {
      // Arrange - Create document type with culture-variant property (single property to avoid container bug)
      docTypeBuilder = await new DocumentTypeBuilder()
        .withName(ADD_PROPS_DOC_TYPE_NAME)
        .allowAsRoot(true)
        .variesByCulture(true)
        .withProperty("author", "Author", TextString_DATA_TYPE_ID, { variesByCulture: true })
        .create();

      // Create document with variant but no values
      const docBuilder = await new DocumentBuilder()
        .withDocumentType(docTypeBuilder.getId())
        .withVariant(ADD_PROPS_DOC_NAME, "en-US")
        .create();

      const documentId = docBuilder.getId();

      // Act - Try to add author without a culture (should fail - variant property)
      const result = await UpdateDocumentPropertiesTool.handler(
        {
          id: documentId,
          properties: [
            {
              alias: "author",
              value: AUTHOR_VALUE,
              // Missing culture - should fail for variant property
            },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Should fail with variance error
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toBe("Culture/segment validation failed");
        expect(responseData.message).toContain("author");
        expect(responseData.message).toContain("culture is required");
      }
    });

    it("should return error when property does not exist on document type", async () => {
      // Arrange - Create document type with only title property
      docTypeBuilder = await new DocumentTypeBuilder()
        .withName(ADD_PROPS_DOC_TYPE_NAME)
        .allowAsRoot(true)
        .withProperty("title", "Title", TextString_DATA_TYPE_ID)
        .create();

      // Create document without any values
      const docBuilder = await new DocumentBuilder()
        .withName(ADD_PROPS_DOC_NAME)
        .withDocumentType(docTypeBuilder.getId())
        .create();

      const documentId = docBuilder.getId();

      // Act - Try to add property that doesn't exist on document type
      const result = await UpdateDocumentPropertiesTool.handler(
        {
          id: documentId,
          properties: [
            {
              alias: "nonExistentProperty",
              value: "Some Value",
            },
          ],
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Should fail with invalid aliases
      const content = result.content[0];
      expect(content.type).toBe("text");
      if (content.type === "text") {
        const responseData = JSON.parse(content.text);
        expect(responseData.success).toBe(false);
        expect(responseData.error).toBe("Invalid property aliases");
        expect(responseData.invalidAliases).toContain("nonExistentProperty");
        expect(responseData.availableProperties).toBeDefined();
        expect(responseData.availableProperties.length).toBeGreaterThan(0);
        // Should show the available property from document type
        expect(responseData.availableProperties[0].alias).toBe("title");
      }
    });
  });
});
