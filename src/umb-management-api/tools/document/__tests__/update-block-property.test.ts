import UpdateBlockPropertyTool from "../put/update-block-property.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import CreateElementTypeTool from "../../document-type/post/create-element-type.js";
import { jest } from "@jest/globals";
import {
  ROOT_DOCUMENT_TYPE_ID,
  BLANK_UUID,
} from "../../../../constants/constants.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { v4 as uuidv4 } from "uuid";

// Test constants
const TEST_DOCUMENT_NAME = "_Test Block Property Document";
const TEST_ELEMENT_TYPE_NAME = "_Test Block Element Type";
const TEST_BLOCK_LIST_DATA_TYPE_NAME = "_Test BlockList DataType";
const TEST_DOC_TYPE_WITH_BLOCKS_NAME = "_Test DocType With Blocks";
const INVALID_ALIAS = "nonExistentProperty";
const FAKE_CONTENT_KEY = "00000000-0000-0000-0000-000000000001";
const NON_EXISTENT_PROPERTY_ALIAS = "nonExistentPropertyAlias";

describe("update-block-property", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  describe("error handling integration tests", () => {
    afterEach(async () => {
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    });

    it("should return error for non-existent document property", async () => {
      // Arrange
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
        .withValue("title", "Test")
        .create();

      // Act
      const result = await UpdateBlockPropertyTool().handler(
        {
          documentId: builder.getId(),
          propertyAlias: INVALID_ALIAS,
          updates: [
            {
              contentKey: uuidv4(),
              blockType: "content",
              properties: [{ alias: "title", value: "Updated" }]
            }
          ]
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
    });

    it("should return error for property without block structure", async () => {
      // Arrange
      const builder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(ROOT_DOCUMENT_TYPE_ID)
        .withValue("title", "Simple Text Value")
        .create();

      // Act
      const result = await UpdateBlockPropertyTool().handler(
        {
          documentId: builder.getId(),
          propertyAlias: "title",
          updates: [
            {
              contentKey: uuidv4(),
              blockType: "content",
              properties: [{ alias: "someAlias", value: "Updated" }]
            }
          ]
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
    });

    it("should handle non-existent document", async () => {
      // Act
      const result = await UpdateBlockPropertyTool().handler(
        {
          documentId: BLANK_UUID,
          propertyAlias: "someProperty",
          updates: [
            {
              contentKey: uuidv4(),
              blockType: "content",
              properties: [{ alias: "title", value: "Updated" }]
            }
          ]
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify the handler response
      expect(result).toMatchSnapshot();
    });
  });

  describe("BlockList integration tests", () => {
    // Store created IDs for cleanup
    let elementTypeId: string | null = null;
    let blockListDataTypeId: string | null = null;
    let docTypeWithBlocksId: string | null = null;

    beforeEach(async () => {
      // Clean up any leftover test data from previous failed runs
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_BLOCKS_NAME);
      await DataTypeTestHelper.cleanup(TEST_BLOCK_LIST_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      // Clean up in reverse order of dependencies
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);

      if (docTypeWithBlocksId) {
        await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_BLOCKS_NAME);
        docTypeWithBlocksId = null;
      }
      if (blockListDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_BLOCK_LIST_DATA_TYPE_NAME);
        blockListDataTypeId = null;
      }
      if (elementTypeId) {
        await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_NAME);
        elementTypeId = null;
      }
    });

    /**
     * Creates test infrastructure: element type, BlockList data type, and document type
     */
    async function createBlockListInfrastructure(): Promise<{
      elementTypeId: string;
      blockListDataTypeId: string;
      docTypeId: string;
    }> {
      // 1. Create an element type with a text property using the tool
      const elementResult = await CreateElementTypeTool().handler({
        name: TEST_ELEMENT_TYPE_NAME,
        alias: TEST_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-document",
        compositions: [],
        properties: [
          {
            name: "Block Title",
            alias: "blockTitle",
            dataTypeId: "0cc0eba1-9960-42c9-bf9b-60e150b429ae", // Textstring data type
            group: "Content"
          }
        ]
      }, { signal: new AbortController().signal });

      const elementResponse = JSON.parse(elementResult.content[0].text as string);
      if (!elementResponse.id) {
        throw new Error(`Failed to create element type: ${JSON.stringify(elementResponse)}`);
      }
      elementTypeId = elementResponse.id;

      // 2. Create a BlockList data type configured with the element type
      const blockListBuilder = await new DataTypeBuilder()
        .withName(TEST_BLOCK_LIST_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockList")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockList")
        .withValue("blocks", [
          {
            contentElementTypeKey: elementTypeId,
            label: "Test Block"
          }
        ])
        .create();
      blockListDataTypeId = blockListBuilder.getId();

      // 3. Create a document type with the BlockList property
      const docTypeBuilder = await new DocumentTypeBuilder()
        .withName(TEST_DOC_TYPE_WITH_BLOCKS_NAME)
        .allowAsRoot(true)
        .withProperty("blocks", "Blocks", blockListDataTypeId)
        .create();
      docTypeWithBlocksId = docTypeBuilder.getId();

      return {
        elementTypeId: elementTypeId!,
        blockListDataTypeId: blockListDataTypeId!,
        docTypeId: docTypeWithBlocksId!
      };
    }

    /**
     * Creates a BlockList value structure
     */
    function createBlockListValue(blocks: Array<{ key: string; blockTitle: string }>): object {
      return {
        layout: {
          "Umbraco.BlockList": blocks.map(b => ({ contentKey: b.key }))
        },
        contentData: blocks.map(b => ({
          key: b.key,
          contentTypeKey: elementTypeId,
          values: [
            { alias: "blockTitle", value: b.blockTitle }
          ]
        })),
        settingsData: [],
        expose: blocks.map(b => ({ contentKey: b.key, culture: null, segment: null }))
      };
    }

    /**
     * Helper to get block property value from document
     */
    async function getBlockPropertyValue(documentId: string, propertyAlias: string): Promise<unknown> {
      const client = UmbracoManagementClient.getClient();
      const doc = await client.getDocumentById(documentId);
      const property = doc.values.find(v => v.alias === propertyAlias);
      return property?.value;
    }

    it("should update property in BlockList content block", async () => {
      // Arrange
      const { docTypeId } = await createBlockListInfrastructure();
      const blockKey = uuidv4();
      const blockListValue = createBlockListValue([
        { key: blockKey, blockTitle: "Original Title" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("blocks", blockListValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool().handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: "blockTitle", value: "Updated Title" }]
          }]
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the update persisted in the document
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "blocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };
      const updatedBlock = updatedBlockValue.contentData.find(b => b.key === blockKey);
      const updatedProperty = updatedBlock?.values.find(v => v.alias === "blockTitle");
      expect(updatedProperty?.value).toBe("Updated Title");
    });

    it("should return error with available blocks when block not found", async () => {
      // Arrange
      const { docTypeId } = await createBlockListInfrastructure();
      const blockKey = uuidv4();
      const blockListValue = createBlockListValue([
        { key: blockKey, blockTitle: "Test Block" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("blocks", blockListValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool().handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: FAKE_CONTENT_KEY,
            blockType: "content",
            properties: [{ alias: "blockTitle", value: "Test" }]
          }]
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the original block was not modified
      const blockValue = await getBlockPropertyValue(docBuilder.getId(), "blocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };
      const originalBlock = blockValue.contentData.find(b => b.key === blockKey);
      const originalProperty = originalBlock?.values.find(v => v.alias === "blockTitle");
      expect(originalProperty?.value).toBe("Test Block");
    });

    it("should batch update multiple blocks in single call", async () => {
      // Arrange
      const { docTypeId } = await createBlockListInfrastructure();
      const blockKey1 = uuidv4();
      const blockKey2 = uuidv4();
      const blockListValue = createBlockListValue([
        { key: blockKey1, blockTitle: "Block 1" },
        { key: blockKey2, blockTitle: "Block 2" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("blocks", blockListValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool().handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [
            {
              contentKey: blockKey1,
              blockType: "content",
              properties: [{ alias: "blockTitle", value: "Updated Block 1" }]
            },
            {
              contentKey: blockKey2,
              blockType: "content",
              properties: [{ alias: "blockTitle", value: "Updated Block 2" }]
            }
          ]
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify both blocks were updated
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "blocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };

      const updatedBlock1 = updatedBlockValue.contentData.find(b => b.key === blockKey1);
      const updatedProperty1 = updatedBlock1?.values.find(v => v.alias === "blockTitle");
      expect(updatedProperty1?.value).toBe("Updated Block 1");

      const updatedBlock2 = updatedBlockValue.contentData.find(b => b.key === blockKey2);
      const updatedProperty2 = updatedBlock2?.values.find(v => v.alias === "blockTitle");
      expect(updatedProperty2?.value).toBe("Updated Block 2");
    });

    it("should return warning when property not found in block", async () => {
      // Arrange
      const { docTypeId } = await createBlockListInfrastructure();
      const blockKey = uuidv4();
      const blockListValue = createBlockListValue([
        { key: blockKey, blockTitle: "Test Block" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("blocks", blockListValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool().handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: NON_EXISTENT_PROPERTY_ALIAS, value: "Test" }]
          }]
        },
        { signal: new AbortController().signal }
      );

      // Assert - Verify the handler response includes warning
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the original block was not modified
      const blockValue = await getBlockPropertyValue(docBuilder.getId(), "blocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };
      const originalBlock = blockValue.contentData.find(b => b.key === blockKey);
      const originalProperty = originalBlock?.values.find(v => v.alias === "blockTitle");
      expect(originalProperty?.value).toBe("Test Block");
    });
  });
});
