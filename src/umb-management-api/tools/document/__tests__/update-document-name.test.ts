import UpdateDocumentNameTool, { updateDocumentNameOutputSchema } from "../put/update-document-name.js";
import CreateDocumentTool, { createOutputSchema } from "../post/create-document.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { LanguageBuilder } from "../../language/__tests__/helpers/language-builder.js";
import { TemplateBuilder } from "../../template/__tests__/helpers/template-builder.js";
import { TemplateTestHelper } from "../../template/__tests__/helpers/template-helper.js";
import { ROOT_DOCUMENT_TYPE_ID } from "../../../../constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  BLANK_UUID,
  TextString_DATA_TYPE_ID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateStructuredContent,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("update-document-name", () => {
  const TEST_DOCUMENT_NAME = "_Test Document Name";
  const RENAMED_DOCUMENT_NAME = "_Renamed Test Document";
  const INITIAL_TITLE = "_Initial Title";
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(RENAMED_DOCUMENT_NAME);
  });

  it("should rename an invariant document", async () => {
    // Arrange - Create an invariant document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
      .withValue("title", INITIAL_TITLE)
      .create();

    // Act - Rename the document
    const result = await UpdateDocumentNameTool.handler(
      {
        id: builder.getId(),
        name: RENAMED_DOCUMENT_NAME,
        culture: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the handler response with normalized IDs and dates
    const normalizedResult = createSnapshotResult(result, builder.getId());
    expect(normalizedResult).toMatchSnapshot();

    // Verify the name was actually updated
    const client = UmbracoManagementClient.getClient();
    const updatedDocument = await client.getDocumentById(builder.getId());
    expect(updatedDocument.variants).toHaveLength(1);
    expect(updatedDocument.variants[0].name).toBe(RENAMED_DOCUMENT_NAME);
  });

  it("should preserve property values and template when renaming (regression for #253)", async () => {
    // Arrange - Create a template and a doc type that uses it as default
    const TEST_TEMPLATE_NAME = "_Test Rename Template";
    const TEST_DOC_TYPE_NAME = "_Test Rename DocType";

    const template = await new TemplateBuilder()
      .withName(TEST_TEMPLATE_NAME)
      .create();
    const templateId = template.getId();

    const docType = await new DocumentTypeBuilder()
      .withName(TEST_DOC_TYPE_NAME)
      .allowAsRoot(true)
      .withDefaultTemplate(templateId)
      .withAllowedTemplate(templateId)
      .withProperty("title", "Title", TextString_DATA_TYPE_ID)
      .create();

    try {
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docType.getId())
        .withValue("title", INITIAL_TITLE)
        .create();

      const client = UmbracoManagementClient.getClient();
      const beforeRename = await client.getDocumentById(builder.getId());
      expect(beforeRename.template?.id).toBe(templateId);

      // Act - Rename the document
      const result = await UpdateDocumentNameTool.handler(
        {
          id: builder.getId(),
          name: RENAMED_DOCUMENT_NAME,
          culture: undefined,
        },
        createMockRequestHandlerExtra()
      );

      const responseData = validateStructuredContent(result, updateDocumentNameOutputSchema);
      expect(responseData.success).toBe(true);

      // Assert - template and property values are untouched, only the name changed
      const afterRename = await client.getDocumentById(builder.getId());
      expect(afterRename.variants[0].name).toBe(RENAMED_DOCUMENT_NAME);
      expect(afterRename.template?.id).toBe(templateId);
      const titleValue = afterRename.values.find((v) => v.alias === "title");
      expect(titleValue?.value).toBe(INITIAL_TITLE);
    } finally {
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_NAME);
      await TemplateTestHelper.cleanup(TEST_TEMPLATE_NAME);
    }
  });

  it("should handle non-existent document", async () => {
    const result = await UpdateDocumentNameTool.handler(
      {
        id: BLANK_UUID,
        name: RENAMED_DOCUMENT_NAME,
        culture: undefined,
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });

  describe("multi-culture support", () => {
    const MULTI_CULTURE_DOC_NAME = "_Test Multi-Culture Rename Document";
    const MULTI_CULTURE_DOC_TYPE_NAME = "_Test Multi-Culture Rename DocType";
    const EN_US_NAME = "_English Name";
    const DA_DK_NAME = "_Danish Name";
    const RENAMED_DA_DK_NAME = "_Renamed Danish Name";

    let languageBuilder: LanguageBuilder | null = null;
    let docTypeBuilder: DocumentTypeBuilder | null = null;

    beforeEach(async () => {
      await DocumentTestHelper.cleanup(MULTI_CULTURE_DOC_NAME);
      await DocumentTypeTestHelper.cleanup(MULTI_CULTURE_DOC_TYPE_NAME);
    });

    afterEach(async () => {
      await DocumentTestHelper.cleanup(MULTI_CULTURE_DOC_NAME);

      if (docTypeBuilder) {
        await DocumentTypeTestHelper.cleanup(MULTI_CULTURE_DOC_TYPE_NAME);
        docTypeBuilder = null;
      }

      if (languageBuilder) {
        await languageBuilder.cleanup();
        languageBuilder = null;
      }
    });

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

    async function createMultiCultureDocType(): Promise<string> {
      docTypeBuilder = await new DocumentTypeBuilder()
        .withName(MULTI_CULTURE_DOC_TYPE_NAME)
        .allowAsRoot(true)
        .variesByCulture(true)
        .create();

      return docTypeBuilder.getId();
    }

    it("should rename a specific culture variant, leaving other cultures untouched", async () => {
      const client = UmbracoManagementClient.getClient();

      await ensureDanishLanguage();
      const docTypeId = await createMultiCultureDocType();

      const createResult = await CreateDocumentTool.handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US", "da-DK"],
          values: [],
          parentId: undefined,
          templateId: undefined,
        },
        createMockRequestHandlerExtra()
      );

      const createResponse = validateStructuredContent(createResult, createOutputSchema);
      const documentId = createResponse.id;

      // Act - rename only the Danish variant
      const result = await UpdateDocumentNameTool.handler(
        {
          id: documentId,
          name: RENAMED_DA_DK_NAME,
          culture: "da-DK",
        },
        createMockRequestHandlerExtra()
      );

      const responseData = validateStructuredContent(result, updateDocumentNameOutputSchema);
      expect(responseData.success).toBe(true);
      expect(responseData.culture).toBe("da-DK");

      const updatedDocument = await client.getDocumentById(documentId);
      const enVariant = updatedDocument.variants.find((v) => v.culture === "en-US");
      const daVariant = updatedDocument.variants.find((v) => v.culture === "da-DK");

      expect(daVariant?.name).toBe(RENAMED_DA_DK_NAME);
      expect(enVariant?.name).toBe(MULTI_CULTURE_DOC_NAME); // Unchanged
    });

    it("should return a helpful error when culture is required but omitted", async () => {
      await ensureDanishLanguage();
      const docTypeId = await createMultiCultureDocType();

      const createResult = await CreateDocumentTool.handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US", "da-DK"],
          values: [],
          parentId: undefined,
          templateId: undefined,
        },
        createMockRequestHandlerExtra()
      );
      const createResponse = validateStructuredContent(createResult, createOutputSchema);
      const documentId = createResponse.id;

      // Act - Try to rename without specifying a culture
      const result = await UpdateDocumentNameTool.handler(
        {
          id: documentId,
          name: RENAMED_DA_DK_NAME,
          culture: undefined,
        },
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBe(true);
      const responseData = result.structuredContent as {
        title: string;
        availableCultures: { culture: string | null; name: string }[];
      };
      expect(responseData.title).toBe("Culture is required");
      expect(responseData.availableCultures).toHaveLength(2);
      expect(responseData.availableCultures.map((c) => c.culture).sort()).toEqual([
        "da-DK",
        "en-US",
      ]);
    });

    it("should return a helpful error when culture does not match any variant", async () => {
      await ensureDanishLanguage();
      const docTypeId = await createMultiCultureDocType();

      const createResult = await CreateDocumentTool.handler(
        {
          documentTypeId: docTypeId,
          name: MULTI_CULTURE_DOC_NAME,
          cultures: ["en-US", "da-DK"],
          values: [],
          parentId: undefined,
          templateId: undefined,
        },
        createMockRequestHandlerExtra()
      );
      const createResponse = validateStructuredContent(createResult, createOutputSchema);
      const documentId = createResponse.id;

      // Act - Try to rename with a culture that doesn't exist on this document
      const result = await UpdateDocumentNameTool.handler(
        {
          id: documentId,
          name: RENAMED_DA_DK_NAME,
          culture: "fr-FR",
        },
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBe(true);
      const responseData = result.structuredContent as {
        title: string;
        availableCultures: { culture: string | null; name: string }[];
      };
      expect(responseData.title).toBe("Invalid culture");
      expect(responseData.availableCultures.map((c) => c.culture).sort()).toEqual([
        "da-DK",
        "en-US",
      ]);
    });
  });
});
