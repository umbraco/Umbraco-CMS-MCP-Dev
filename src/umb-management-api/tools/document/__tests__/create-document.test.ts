import CreateDocumentTool from "../post/create-document.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { jest } from "@jest/globals";
import { ROOT_DOCUMENT_TYPE_ID } from "../../../../constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";

const TEST_DOCUMENT_NAME = "_Test Document Created";

describe("create-document", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should create a document", async () => {
    // Create document model
    const docModel = {
      documentTypeId: ROOT_DOCUMENT_TYPE_ID,
      name: TEST_DOCUMENT_NAME,
      values: [],
    };

    // Create the document
    const result = await CreateDocumentTool().handler(docModel, {
      signal: new AbortController().signal,
    });

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the created item exists and matches expected values
    const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(item).toBeDefined();
    const norm = {
      ...DocumentTestHelper.normaliseIds(item!),
      createDate: "<normalized>",
    };
    expect(norm).toMatchSnapshot();
  });

  it("should create a document with additional properties", async () => {
    // Create a more complex document with additional values
    const docModel = {
      documentTypeId: ROOT_DOCUMENT_TYPE_ID,
      name: TEST_DOCUMENT_NAME,
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

    const result = await CreateDocumentTool().handler(docModel, {
      signal: new AbortController().signal,
    });

    expect(result).toMatchSnapshot();

    const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(item).toBeDefined();
    const norm = {
      ...DocumentTestHelper.normaliseIds(item!),
      createDate: "<normalized>",
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
        cultures: ["en-US", "da-DK"],
        values: [],
      };

      const result = await CreateDocumentTool().handler(docModel, {
        signal: new AbortController().signal,
      });

      expect(result).toMatchSnapshot();

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
      cultures: [],
      values: [],
    };

    const result = await CreateDocumentTool().handler(docModel, {
      signal: new AbortController().signal,
    });

    expect(result).toMatchSnapshot();

    const item = await DocumentTestHelper.findDocument(TEST_DOCUMENT_NAME);
    expect(item).toBeDefined();
    // Should have single variant with null culture (original behavior)
    expect(item!.variants).toHaveLength(1);
    expect(item!.variants[0].culture).toBeNull();
  });
});
