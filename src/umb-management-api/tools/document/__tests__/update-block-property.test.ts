import UpdateBlockPropertyTool from "../put/update-block-property.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import CreateElementTypeTool, { createElementTypeOutputSchema } from "../../document-type/post/create-element-type.js";
import { jest } from "@jest/globals";
import {
  ROOT_DOCUMENT_TYPE_ID,
  BLANK_UUID,
  TextString_DATA_TYPE_ID,
} from "../../../../constants/constants.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
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
      const result = await UpdateBlockPropertyTool.handler(
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
        createMockRequestHandlerExtra()
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
      const result = await UpdateBlockPropertyTool.handler(
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
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
    });

    it("should handle non-existent document", async () => {
      // Act
      const result = await UpdateBlockPropertyTool.handler(
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
        createMockRequestHandlerExtra()
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
      const elementResult = await CreateElementTypeTool.handler({
        name: TEST_ELEMENT_TYPE_NAME,
        alias: TEST_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-document",
        compositions: [],
        properties: [
          {
            name: "Block Title",
            alias: "blockTitle",
            dataTypeId: TextString_DATA_TYPE_ID, 
            group: "Content"
          }
        ]
      }, createMockRequestHandlerExtra());

      const elementResponse = validateStructuredContent(elementResult, createElementTypeOutputSchema);
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
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: "blockTitle", value: "Updated Title" }]
          }]
        },
        createMockRequestHandlerExtra()
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
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: FAKE_CONTENT_KEY,
            blockType: "content",
            properties: [{ alias: "blockTitle", value: "Test" }]
          }]
        },
        createMockRequestHandlerExtra()
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
      const result = await UpdateBlockPropertyTool.handler(
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
        createMockRequestHandlerExtra()
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

    it("should return error when property not found in block and not on Element Type", async () => {
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
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: NON_EXISTENT_PROPERTY_ALIAS, value: "Test" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response includes error
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

  describe("add new properties to blocks", () => {
    // Test constants for add property tests
    const TEST_ELEMENT_TYPE_WITH_EXTRA_NAME = "_Test Block Element Extra Props";
    const TEST_BLOCK_LIST_EXTRA_DATA_TYPE_NAME = "_Test BlockList Extra DataType";
    const TEST_DOC_TYPE_WITH_EXTRA_BLOCKS_NAME = "_Test DocType Extra Blocks";

    // Store created IDs for cleanup
    let elementTypeExtraId: string | null = null;
    let blockListExtraDataTypeId: string | null = null;
    let docTypeWithExtraBlocksId: string | null = null;

    beforeEach(async () => {
      // Clean up any leftover test data from previous failed runs
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_EXTRA_BLOCKS_NAME);
      await DataTypeTestHelper.cleanup(TEST_BLOCK_LIST_EXTRA_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_WITH_EXTRA_NAME);
    });

    afterEach(async () => {
      // Clean up in reverse order of dependencies
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);

      if (docTypeWithExtraBlocksId) {
        await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_EXTRA_BLOCKS_NAME);
        docTypeWithExtraBlocksId = null;
      }
      if (blockListExtraDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_BLOCK_LIST_EXTRA_DATA_TYPE_NAME);
        blockListExtraDataTypeId = null;
      }
      if (elementTypeExtraId) {
        await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_WITH_EXTRA_NAME);
        elementTypeExtraId = null;
      }
    });

    /**
     * Creates test infrastructure with Element Type that has multiple properties
     */
    async function createBlockListWithExtraProperties(): Promise<{
      elementTypeId: string;
      blockListDataTypeId: string;
      docTypeId: string;
    }> {
      // 1. Create an element type with TWO text properties using the tool
      const elementResult = await CreateElementTypeTool.handler({
        name: TEST_ELEMENT_TYPE_WITH_EXTRA_NAME,
        alias: TEST_ELEMENT_TYPE_WITH_EXTRA_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-document",
        compositions: [],
        properties: [
          {
            name: "Block Title",
            alias: "blockTitle",
            dataTypeId: TextString_DATA_TYPE_ID, 
            group: "Content"
          },
          {
            name: "Block Subtitle",
            alias: "blockSubtitle",
            dataTypeId: TextString_DATA_TYPE_ID,
            group: "Content"
          }
        ]
      }, createMockRequestHandlerExtra());

      const elementResponse = validateStructuredContent(elementResult, createElementTypeOutputSchema);
      if (!elementResponse.id) {
        throw new Error(`Failed to create element type: ${JSON.stringify(elementResponse)}`);
      }
      elementTypeExtraId = elementResponse.id;

      // 2. Create a BlockList data type configured with the element type
      const blockListBuilder = await new DataTypeBuilder()
        .withName(TEST_BLOCK_LIST_EXTRA_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockList")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockList")
        .withValue("blocks", [
          {
            contentElementTypeKey: elementTypeExtraId,
            label: "Test Block With Extra"
          }
        ])
        .create();
      blockListExtraDataTypeId = blockListBuilder.getId();

      // 3. Create a document type with the BlockList property
      const docTypeBuilder = await new DocumentTypeBuilder()
        .withName(TEST_DOC_TYPE_WITH_EXTRA_BLOCKS_NAME)
        .allowAsRoot(true)
        .withProperty("blocks", "Blocks", blockListExtraDataTypeId)
        .create();
      docTypeWithExtraBlocksId = docTypeBuilder.getId();

      return {
        elementTypeId: elementTypeExtraId!,
        blockListDataTypeId: blockListExtraDataTypeId!,
        docTypeId: docTypeWithExtraBlocksId!
      };
    }

    /**
     * Creates a BlockList value structure with only blockTitle (no blockSubtitle)
     */
    function createBlockListValueWithoutSubtitle(
      blocks: Array<{ key: string; blockTitle: string }>,
      contentTypeKey: string
    ): object {
      return {
        layout: {
          "Umbraco.BlockList": blocks.map(b => ({ contentKey: b.key }))
        },
        contentData: blocks.map(b => ({
          key: b.key,
          contentTypeKey: contentTypeKey,
          values: [
            { alias: "blockTitle", value: b.blockTitle }
            // Note: blockSubtitle is intentionally NOT included
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

    it("should add new property that exists on Element Type but not on block", async () => {
      // Arrange - Create infrastructure with Element Type that has blockTitle AND blockSubtitle
      const { docTypeId, elementTypeId } = await createBlockListWithExtraProperties();
      const blockKey = uuidv4();

      // Create block with only blockTitle (blockSubtitle not set)
      const blockListValue = createBlockListValueWithoutSubtitle(
        [{ key: blockKey, blockTitle: "Original Title" }],
        elementTypeId
      );

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("blocks", blockListValue)
        .create();

      // Act - Add the blockSubtitle property that exists on Element Type but not on block
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: "blockSubtitle", value: "New Subtitle" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the property was added to the block
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "blocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };
      const updatedBlock = updatedBlockValue.contentData.find(b => b.key === blockKey);
      const addedProperty = updatedBlock?.values.find(v => v.alias === "blockSubtitle");
      expect(addedProperty?.value).toBe("New Subtitle");

      // Also verify original property is preserved
      const originalProperty = updatedBlock?.values.find(v => v.alias === "blockTitle");
      expect(originalProperty?.value).toBe("Original Title");
    });

    it("should mix update and add in single block call", async () => {
      // Arrange
      const { docTypeId, elementTypeId } = await createBlockListWithExtraProperties();
      const blockKey = uuidv4();

      const blockListValue = createBlockListValueWithoutSubtitle(
        [{ key: blockKey, blockTitle: "Original Title" }],
        elementTypeId
      );

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("blocks", blockListValue)
        .create();

      // Act - Update blockTitle AND add blockSubtitle in same call
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [
              { alias: "blockTitle", value: "Updated Title" },
              { alias: "blockSubtitle", value: "New Subtitle" }
            ]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response shows both updated and added
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify both properties
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "blocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };
      const updatedBlock = updatedBlockValue.contentData.find(b => b.key === blockKey);

      const updatedProperty = updatedBlock?.values.find(v => v.alias === "blockTitle");
      expect(updatedProperty?.value).toBe("Updated Title");

      const addedProperty = updatedBlock?.values.find(v => v.alias === "blockSubtitle");
      expect(addedProperty?.value).toBe("New Subtitle");
    });

    it("should return error when property does not exist on Element Type", async () => {
      // Arrange
      const { docTypeId, elementTypeId } = await createBlockListWithExtraProperties();
      const blockKey = uuidv4();

      const blockListValue = createBlockListValueWithoutSubtitle(
        [{ key: blockKey, blockTitle: "Test Block" }],
        elementTypeId
      );

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("blocks", blockListValue)
        .create();

      // Act - Try to add a property that doesn't exist on Element Type
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "blocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: "nonExistentOnElementType", value: "Test" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response includes error
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();
    });
  });

  describe("BlockGrid integration tests", () => {
    // Test constants for BlockGrid
    const TEST_BLOCK_GRID_ELEMENT_TYPE_NAME = "_Test BlockGrid Element Type";
    const TEST_BLOCK_GRID_DATA_TYPE_NAME = "_Test BlockGrid DataType";
    const TEST_DOC_TYPE_WITH_BLOCK_GRID_NAME = "_Test DocType With BlockGrid";

    // Store created IDs for cleanup
    let blockGridElementTypeId: string | null = null;
    let blockGridDataTypeId: string | null = null;
    let docTypeWithBlockGridId: string | null = null;

    beforeEach(async () => {
      // Clean up any leftover test data from previous failed runs
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_BLOCK_GRID_NAME);
      await DataTypeTestHelper.cleanup(TEST_BLOCK_GRID_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_BLOCK_GRID_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      // Clean up in reverse order of dependencies
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);

      if (docTypeWithBlockGridId) {
        await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_BLOCK_GRID_NAME);
        docTypeWithBlockGridId = null;
      }
      if (blockGridDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_BLOCK_GRID_DATA_TYPE_NAME);
        blockGridDataTypeId = null;
      }
      if (blockGridElementTypeId) {
        await DocumentTypeTestHelper.cleanup(TEST_BLOCK_GRID_ELEMENT_TYPE_NAME);
        blockGridElementTypeId = null;
      }
    });

    /**
     * Creates test infrastructure: element type, BlockGrid data type, and document type
     */
    async function createBlockGridInfrastructure(): Promise<{
      elementTypeId: string;
      blockGridDataTypeId: string;
      docTypeId: string;
    }> {
      // 1. Create an element type with a text property using the tool
      const elementResult = await CreateElementTypeTool.handler({
        name: TEST_BLOCK_GRID_ELEMENT_TYPE_NAME,
        alias: TEST_BLOCK_GRID_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-document",
        compositions: [],
        properties: [
          {
            name: "Grid Block Title",
            alias: "gridBlockTitle",
            dataTypeId: TextString_DATA_TYPE_ID,
            group: "Content"
          }
        ]
      }, createMockRequestHandlerExtra());

      const elementResponse = validateStructuredContent(elementResult, createElementTypeOutputSchema);
      if (!elementResponse.id) {
        throw new Error(`Failed to create element type: ${JSON.stringify(elementResponse)}`);
      }
      blockGridElementTypeId = elementResponse.id;

      // 2. Create a BlockGrid data type configured with the element type
      const blockGridBuilder = await new DataTypeBuilder()
        .withName(TEST_BLOCK_GRID_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockGrid")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockGrid")
        .withValue("blocks", [
          {
            contentElementTypeKey: blockGridElementTypeId,
            label: "Test Grid Block",
            columnSpanOptions: [],
            rowMinSpan: 1,
            rowMaxSpan: 1,
            allowAtRoot: true,
            allowInAreas: true
          }
        ])
        .create();
      blockGridDataTypeId = blockGridBuilder.getId();

      // 3. Create a document type with the BlockGrid property
      const docTypeBuilder = await new DocumentTypeBuilder()
        .withName(TEST_DOC_TYPE_WITH_BLOCK_GRID_NAME)
        .allowAsRoot(true)
        .withProperty("gridBlocks", "Grid Blocks", blockGridDataTypeId)
        .create();
      docTypeWithBlockGridId = docTypeBuilder.getId();

      return {
        elementTypeId: blockGridElementTypeId!,
        blockGridDataTypeId: blockGridDataTypeId!,
        docTypeId: docTypeWithBlockGridId!
      };
    }

    /**
     * Creates a BlockGrid value structure
     */
    function createBlockGridValue(blocks: Array<{ key: string; gridBlockTitle: string }>): object {
      return {
        layout: {
          "Umbraco.BlockGrid": blocks.map(b => ({
            contentKey: b.key,
            columnSpan: 12,
            rowSpan: 1,
            areas: []
          }))
        },
        contentData: blocks.map(b => ({
          key: b.key,
          contentTypeKey: blockGridElementTypeId,
          values: [
            { alias: "gridBlockTitle", value: b.gridBlockTitle }
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

    it("should update property in BlockGrid content block", async () => {
      // Arrange
      const { docTypeId } = await createBlockGridInfrastructure();
      const blockKey = uuidv4();
      const blockGridValue = createBlockGridValue([
        { key: blockKey, gridBlockTitle: "Original Grid Title" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("gridBlocks", blockGridValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "gridBlocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: "gridBlockTitle", value: "Updated Grid Title" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the update persisted in the document
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "gridBlocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };
      const updatedBlock = updatedBlockValue.contentData.find(b => b.key === blockKey);
      const updatedProperty = updatedBlock?.values.find(v => v.alias === "gridBlockTitle");
      expect(updatedProperty?.value).toBe("Updated Grid Title");
    });

    it("should return error with available blocks when BlockGrid block not found", async () => {
      // Arrange
      const { docTypeId } = await createBlockGridInfrastructure();
      const blockKey = uuidv4();
      const blockGridValue = createBlockGridValue([
        { key: blockKey, gridBlockTitle: "Test Grid Block" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("gridBlocks", blockGridValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "gridBlocks",
          updates: [{
            contentKey: FAKE_CONTENT_KEY,
            blockType: "content",
            properties: [{ alias: "gridBlockTitle", value: "Test" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the original block was not modified
      const blockValue = await getBlockPropertyValue(docBuilder.getId(), "gridBlocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };
      const originalBlock = blockValue.contentData.find(b => b.key === blockKey);
      const originalProperty = originalBlock?.values.find(v => v.alias === "gridBlockTitle");
      expect(originalProperty?.value).toBe("Test Grid Block");
    });

    it("should batch update multiple BlockGrid blocks in single call", async () => {
      // Arrange
      const { docTypeId } = await createBlockGridInfrastructure();
      const blockKey1 = uuidv4();
      const blockKey2 = uuidv4();
      const blockGridValue = createBlockGridValue([
        { key: blockKey1, gridBlockTitle: "Grid Block 1" },
        { key: blockKey2, gridBlockTitle: "Grid Block 2" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("gridBlocks", blockGridValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "gridBlocks",
          updates: [
            {
              contentKey: blockKey1,
              blockType: "content",
              properties: [{ alias: "gridBlockTitle", value: "Updated Grid Block 1" }]
            },
            {
              contentKey: blockKey2,
              blockType: "content",
              properties: [{ alias: "gridBlockTitle", value: "Updated Grid Block 2" }]
            }
          ]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify both blocks were updated
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "gridBlocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };

      const updatedBlock1 = updatedBlockValue.contentData.find(b => b.key === blockKey1);
      const updatedProperty1 = updatedBlock1?.values.find(v => v.alias === "gridBlockTitle");
      expect(updatedProperty1?.value).toBe("Updated Grid Block 1");

      const updatedBlock2 = updatedBlockValue.contentData.find(b => b.key === blockKey2);
      const updatedProperty2 = updatedBlock2?.values.find(v => v.alias === "gridBlockTitle");
      expect(updatedProperty2?.value).toBe("Updated Grid Block 2");
    });

    it("should return error when property not found in BlockGrid block and not on Element Type", async () => {
      // Arrange
      const { docTypeId } = await createBlockGridInfrastructure();
      const blockKey = uuidv4();
      const blockGridValue = createBlockGridValue([
        { key: blockKey, gridBlockTitle: "Test Grid Block" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("gridBlocks", blockGridValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "gridBlocks",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: NON_EXISTENT_PROPERTY_ALIAS, value: "Test" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response includes error
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the original block was not modified
      const blockValue = await getBlockPropertyValue(docBuilder.getId(), "gridBlocks") as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
      };
      const originalBlock = blockValue.contentData.find(b => b.key === blockKey);
      const originalProperty = originalBlock?.values.find(v => v.alias === "gridBlockTitle");
      expect(originalProperty?.value).toBe("Test Grid Block");
    });
  });

  describe("Nested BlockList within BlockGrid integration tests", () => {
    // Test constants for nested structure
    const TEST_INNER_ELEMENT_TYPE_NAME = "_Test Inner BlockList Element";
    const TEST_INNER_BLOCK_LIST_DATA_TYPE_NAME = "_Test Inner BlockList DataType";
    const TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME = "_Test Grid Element With BlockList";
    const TEST_NESTED_BLOCK_GRID_DATA_TYPE_NAME = "_Test Nested BlockGrid DataType";
    const TEST_DOC_TYPE_WITH_NESTED_BLOCKS_NAME = "_Test DocType With Nested Blocks";

    // Store created IDs for cleanup
    let innerElementTypeId: string | null = null;
    let innerBlockListDataTypeId: string | null = null;
    let gridElementWithBlockListId: string | null = null;
    let nestedBlockGridDataTypeId: string | null = null;
    let docTypeWithNestedBlocksId: string | null = null;

    beforeEach(async () => {
      // Clean up any leftover test data from previous failed runs
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_NESTED_BLOCKS_NAME);
      await DataTypeTestHelper.cleanup(TEST_NESTED_BLOCK_GRID_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME);
      await DataTypeTestHelper.cleanup(TEST_INNER_BLOCK_LIST_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_INNER_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      // Clean up in reverse order of dependencies
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);

      if (docTypeWithNestedBlocksId) {
        await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_NESTED_BLOCKS_NAME);
        docTypeWithNestedBlocksId = null;
      }
      if (nestedBlockGridDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_NESTED_BLOCK_GRID_DATA_TYPE_NAME);
        nestedBlockGridDataTypeId = null;
      }
      if (gridElementWithBlockListId) {
        await DocumentTypeTestHelper.cleanup(TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME);
        gridElementWithBlockListId = null;
      }
      if (innerBlockListDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_INNER_BLOCK_LIST_DATA_TYPE_NAME);
        innerBlockListDataTypeId = null;
      }
      if (innerElementTypeId) {
        await DocumentTypeTestHelper.cleanup(TEST_INNER_ELEMENT_TYPE_NAME);
        innerElementTypeId = null;
      }
    });

    /**
     * Creates test infrastructure for nested BlockList within BlockGrid:
     * 1. Inner element type (for blocks inside the BlockList)
     * 2. BlockList data type (configured with inner element)
     * 3. Grid element type (with a BlockList property)
     * 4. BlockGrid data type (configured with grid element)
     * 5. Document type (with BlockGrid property)
     */
    async function createNestedBlockInfrastructure(): Promise<{
      innerElementTypeId: string;
      innerBlockListDataTypeId: string;
      gridElementId: string;
      blockGridDataTypeId: string;
      docTypeId: string;
    }> {
      // 1. Create inner element type for the nested BlockList blocks
      const innerElementResult = await CreateElementTypeTool.handler({
        name: TEST_INNER_ELEMENT_TYPE_NAME,
        alias: TEST_INNER_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-document",
        compositions: [],
        properties: [
          {
            name: "Inner Title",
            alias: "innerTitle",
            dataTypeId: TextString_DATA_TYPE_ID,
            group: "Content"
          }
        ]
      }, createMockRequestHandlerExtra());

      const innerElementResponse = validateStructuredContent(innerElementResult, createElementTypeOutputSchema);
      if (!innerElementResponse.id) {
        throw new Error(`Failed to create inner element type: ${JSON.stringify(innerElementResponse)}`);
      }
      innerElementTypeId = innerElementResponse.id;

      // 2. Create BlockList data type for the nested blocks
      const innerBlockListBuilder = await new DataTypeBuilder()
        .withName(TEST_INNER_BLOCK_LIST_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockList")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockList")
        .withValue("blocks", [
          {
            contentElementTypeKey: innerElementTypeId,
            label: "Inner Block"
          }
        ])
        .create();
      innerBlockListDataTypeId = innerBlockListBuilder.getId();

      // 3. Create grid element type that contains the BlockList property
      const gridElementResult = await CreateElementTypeTool.handler({
        name: TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME,
        alias: TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-grid",
        compositions: [],
        properties: [
          {
            name: "Grid Section Title",
            alias: "gridSectionTitle",
            dataTypeId: TextString_DATA_TYPE_ID,
            group: "Content"
          },
          {
            name: "Nested Blocks",
            alias: "nestedBlocks",
            dataTypeId: innerBlockListDataTypeId,
            group: "Content"
          }
        ]
      }, createMockRequestHandlerExtra());

      const gridElementResponse = validateStructuredContent(gridElementResult, createElementTypeOutputSchema);
      if (!gridElementResponse.id) {
        throw new Error(`Failed to create grid element type: ${JSON.stringify(gridElementResponse)}`);
      }
      gridElementWithBlockListId = gridElementResponse.id;

      // 4. Create BlockGrid data type configured with the grid element
      const blockGridBuilder = await new DataTypeBuilder()
        .withName(TEST_NESTED_BLOCK_GRID_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockGrid")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockGrid")
        .withValue("blocks", [
          {
            contentElementTypeKey: gridElementWithBlockListId,
            label: "Grid Section With Nested Blocks",
            columnSpanOptions: [],
            rowMinSpan: 1,
            rowMaxSpan: 1,
            allowAtRoot: true,
            allowInAreas: true
          }
        ])
        .create();
      nestedBlockGridDataTypeId = blockGridBuilder.getId();

      // 5. Create document type with the BlockGrid property
      const docTypeBuilder = await new DocumentTypeBuilder()
        .withName(TEST_DOC_TYPE_WITH_NESTED_BLOCKS_NAME)
        .allowAsRoot(true)
        .withProperty("nestedGridBlocks", "Nested Grid Blocks", nestedBlockGridDataTypeId)
        .create();
      docTypeWithNestedBlocksId = docTypeBuilder.getId();

      return {
        innerElementTypeId: innerElementTypeId!,
        innerBlockListDataTypeId: innerBlockListDataTypeId!,
        gridElementId: gridElementWithBlockListId!,
        blockGridDataTypeId: nestedBlockGridDataTypeId!,
        docTypeId: docTypeWithNestedBlocksId!
      };
    }

    /**
     * Creates a BlockGrid value with nested BlockList structure
     */
    function createNestedBlockGridValue(
      gridBlocks: Array<{
        key: string;
        gridSectionTitle: string;
        nestedBlocks: Array<{ key: string; innerTitle: string }>;
      }>
    ): object {
      // Collect all inner block keys for the expose array
      const allInnerBlocks = gridBlocks.flatMap(gb => gb.nestedBlocks);

      return {
        layout: {
          "Umbraco.BlockGrid": gridBlocks.map(gb => ({
            contentKey: gb.key,
            columnSpan: 12,
            rowSpan: 1,
            areas: []
          }))
        },
        contentData: gridBlocks.map(gb => ({
          key: gb.key,
          contentTypeKey: gridElementWithBlockListId,
          values: [
            { alias: "gridSectionTitle", value: gb.gridSectionTitle },
            {
              alias: "nestedBlocks",
              value: {
                layout: {
                  "Umbraco.BlockList": gb.nestedBlocks.map(nb => ({ contentKey: nb.key }))
                },
                contentData: gb.nestedBlocks.map(nb => ({
                  key: nb.key,
                  contentTypeKey: innerElementTypeId,
                  values: [
                    { alias: "innerTitle", value: nb.innerTitle }
                  ]
                })),
                settingsData: [],
                expose: gb.nestedBlocks.map(nb => ({ contentKey: nb.key, culture: null, segment: null }))
              }
            }
          ]
        })),
        settingsData: [],
        expose: [
          ...gridBlocks.map(gb => ({ contentKey: gb.key, culture: null, segment: null })),
          ...allInnerBlocks.map(nb => ({ contentKey: nb.key, culture: null, segment: null }))
        ]
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

    it("should update property in nested BlockList block within BlockGrid", async () => {
      // Arrange
      const { docTypeId } = await createNestedBlockInfrastructure();
      const gridBlockKey = uuidv4();
      const innerBlockKey = uuidv4();

      const nestedBlockGridValue = createNestedBlockGridValue([
        {
          key: gridBlockKey,
          gridSectionTitle: "Grid Section 1",
          nestedBlocks: [
            { key: innerBlockKey, innerTitle: "Original Inner Title" }
          ]
        }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("nestedGridBlocks", nestedBlockGridValue)
        .create();

      // Act - Update the inner block's property (deep traversal test)
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "nestedGridBlocks",
          updates: [{
            contentKey: innerBlockKey,
            blockType: "content",
            properties: [{ alias: "innerTitle", value: "Updated Inner Title" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the update persisted in the nested structure
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "nestedGridBlocks") as {
        contentData: Array<{
          key: string;
          values: Array<{
            alias: string;
            value: {
              contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
            }
          }>
        }>
      };

      const gridBlock = updatedBlockValue.contentData.find(b => b.key === gridBlockKey);
      const nestedBlocksProperty = gridBlock?.values.find(v => v.alias === "nestedBlocks");
      const innerBlock = nestedBlocksProperty?.value.contentData.find(b => b.key === innerBlockKey);
      const updatedProperty = innerBlock?.values.find(v => v.alias === "innerTitle");
      expect(updatedProperty?.value).toBe("Updated Inner Title");
    });

    it("should update both grid block and nested block in same call", async () => {
      // Arrange
      const { docTypeId } = await createNestedBlockInfrastructure();
      const gridBlockKey = uuidv4();
      const innerBlockKey = uuidv4();

      const nestedBlockGridValue = createNestedBlockGridValue([
        {
          key: gridBlockKey,
          gridSectionTitle: "Original Grid Section",
          nestedBlocks: [
            { key: innerBlockKey, innerTitle: "Original Inner Title" }
          ]
        }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("nestedGridBlocks", nestedBlockGridValue)
        .create();

      // Act - Update both grid block and inner block in single call
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "nestedGridBlocks",
          updates: [
            {
              contentKey: gridBlockKey,
              blockType: "content",
              properties: [{ alias: "gridSectionTitle", value: "Updated Grid Section" }]
            },
            {
              contentKey: innerBlockKey,
              blockType: "content",
              properties: [{ alias: "innerTitle", value: "Updated Inner Title" }]
            }
          ]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify both updates persisted
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "nestedGridBlocks") as {
        contentData: Array<{
          key: string;
          values: Array<{
            alias: string;
            value: any;
          }>
        }>
      };

      // Check grid block update
      const gridBlock = updatedBlockValue.contentData.find(b => b.key === gridBlockKey);
      const gridTitleProperty = gridBlock?.values.find(v => v.alias === "gridSectionTitle");
      expect(gridTitleProperty?.value).toBe("Updated Grid Section");

      // Check nested block update
      const nestedBlocksProperty = gridBlock?.values.find(v => v.alias === "nestedBlocks");
      const innerBlock = nestedBlocksProperty?.value.contentData.find((b: { key: string }) => b.key === innerBlockKey);
      const innerTitleProperty = innerBlock?.values.find((v: { alias: string }) => v.alias === "innerTitle");
      expect(innerTitleProperty?.value).toBe("Updated Inner Title");
    });

    it("should update multiple nested blocks across different grid blocks", async () => {
      // Arrange
      const { docTypeId } = await createNestedBlockInfrastructure();
      const gridBlockKey1 = uuidv4();
      const gridBlockKey2 = uuidv4();
      const innerBlockKey1 = uuidv4();
      const innerBlockKey2 = uuidv4();

      const nestedBlockGridValue = createNestedBlockGridValue([
        {
          key: gridBlockKey1,
          gridSectionTitle: "Grid Section 1",
          nestedBlocks: [
            { key: innerBlockKey1, innerTitle: "Inner Block 1" }
          ]
        },
        {
          key: gridBlockKey2,
          gridSectionTitle: "Grid Section 2",
          nestedBlocks: [
            { key: innerBlockKey2, innerTitle: "Inner Block 2" }
          ]
        }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("nestedGridBlocks", nestedBlockGridValue)
        .create();

      // Act - Update inner blocks from both grid sections
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "nestedGridBlocks",
          updates: [
            {
              contentKey: innerBlockKey1,
              blockType: "content",
              properties: [{ alias: "innerTitle", value: "Updated Inner Block 1" }]
            },
            {
              contentKey: innerBlockKey2,
              blockType: "content",
              properties: [{ alias: "innerTitle", value: "Updated Inner Block 2" }]
            }
          ]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify both nested blocks were updated
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "nestedGridBlocks") as {
        contentData: Array<{
          key: string;
          values: Array<{
            alias: string;
            value: {
              contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
            }
          }>
        }>
      };

      // Check first inner block
      const gridBlock1 = updatedBlockValue.contentData.find(b => b.key === gridBlockKey1);
      const nestedBlocks1 = gridBlock1?.values.find(v => v.alias === "nestedBlocks");
      const innerBlock1 = nestedBlocks1?.value.contentData.find(b => b.key === innerBlockKey1);
      expect(innerBlock1?.values.find(v => v.alias === "innerTitle")?.value).toBe("Updated Inner Block 1");

      // Check second inner block
      const gridBlock2 = updatedBlockValue.contentData.find(b => b.key === gridBlockKey2);
      const nestedBlocks2 = gridBlock2?.values.find(v => v.alias === "nestedBlocks");
      const innerBlock2 = nestedBlocks2?.value.contentData.find(b => b.key === innerBlockKey2);
      expect(innerBlock2?.values.find(v => v.alias === "innerTitle")?.value).toBe("Updated Inner Block 2");
    });
  });

  describe("RichText Editor (RTE) integration tests", () => {
    // Test constants for RTE with blocks
    const TEST_RTE_ELEMENT_TYPE_NAME = "_Test RTE Block Element Type";
    const TEST_RTE_DATA_TYPE_NAME = "_Test RTE DataType";
    const TEST_DOC_TYPE_WITH_RTE_NAME = "_Test DocType With RTE";

    // Store created IDs for cleanup
    let rteElementTypeId: string | null = null;
    let rteDataTypeId: string | null = null;
    let docTypeWithRteId: string | null = null;

    beforeEach(async () => {
      // Clean up any leftover test data from previous failed runs
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_RTE_NAME);
      await DataTypeTestHelper.cleanup(TEST_RTE_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_RTE_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      // Clean up in reverse order of dependencies
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);

      if (docTypeWithRteId) {
        await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_RTE_NAME);
        docTypeWithRteId = null;
      }
      if (rteDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_RTE_DATA_TYPE_NAME);
        rteDataTypeId = null;
      }
      if (rteElementTypeId) {
        await DocumentTypeTestHelper.cleanup(TEST_RTE_ELEMENT_TYPE_NAME);
        rteElementTypeId = null;
      }
    });

    /**
     * Creates test infrastructure: element type, RTE data type with blocks, and document type
     */
    async function createRteInfrastructure(): Promise<{
      elementTypeId: string;
      rteDataTypeId: string;
      docTypeId: string;
    }> {
      // 1. Create an element type with a text property for RTE blocks
      const elementResult = await CreateElementTypeTool.handler({
        name: TEST_RTE_ELEMENT_TYPE_NAME,
        alias: TEST_RTE_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-document",
        compositions: [],
        properties: [
          {
            name: "RTE Block Title",
            alias: "rteBlockTitle",
            dataTypeId: TextString_DATA_TYPE_ID,
            group: "Content"
          }
        ]
      }, createMockRequestHandlerExtra());

      const elementResponse = validateStructuredContent(elementResult, createElementTypeOutputSchema);
      if (!elementResponse.id) {
        throw new Error(`Failed to create element type: ${JSON.stringify(elementResponse)}`);
      }
      rteElementTypeId = elementResponse.id;

      // 2. Create a RichText data type configured with block support
      const rteBuilder = await new DataTypeBuilder()
        .withName(TEST_RTE_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.RichText")
        .withEditorUiAlias("Umb.PropertyEditorUi.Tiptap")
        .withValue("blocks", [
          {
            contentElementTypeKey: rteElementTypeId,
            label: "RTE Block"
          }
        ])
        .create();
      rteDataTypeId = rteBuilder.getId();

      // 3. Create a document type with the RTE property
      const docTypeBuilder = await new DocumentTypeBuilder()
        .withName(TEST_DOC_TYPE_WITH_RTE_NAME)
        .allowAsRoot(true)
        .withProperty("richContent", "Rich Content", rteDataTypeId)
        .create();
      docTypeWithRteId = docTypeBuilder.getId();

      return {
        elementTypeId: rteElementTypeId!,
        rteDataTypeId: rteDataTypeId!,
        docTypeId: docTypeWithRteId!
      };
    }

    /**
     * Creates a RichText value structure with embedded blocks
     */
    function createRteValueWithBlocks(blocks: Array<{ key: string; rteBlockTitle: string }>): object {
      return {
        markup: "<p>Rich text content with embedded blocks</p>",
        blocks: {
          layout: {
            "Umbraco.RichText": blocks.map(b => ({ contentKey: b.key }))
          },
          contentData: blocks.map(b => ({
            key: b.key,
            contentTypeKey: rteElementTypeId,
            values: [
              { alias: "rteBlockTitle", value: b.rteBlockTitle }
            ]
          })),
          settingsData: [],
          expose: blocks.map(b => ({ contentKey: b.key, culture: null, segment: null }))
        }
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

    it("should update property in RTE block content", async () => {
      // Arrange
      const { docTypeId } = await createRteInfrastructure();
      const blockKey = uuidv4();
      const rteValue = createRteValueWithBlocks([
        { key: blockKey, rteBlockTitle: "Original RTE Block Title" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("richContent", rteValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "richContent",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: "rteBlockTitle", value: "Updated RTE Block Title" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the update persisted in the document
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "richContent") as {
        blocks: {
          contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
        }
      };
      const updatedBlock = updatedBlockValue.blocks.contentData.find(b => b.key === blockKey);
      const updatedProperty = updatedBlock?.values.find(v => v.alias === "rteBlockTitle");
      expect(updatedProperty?.value).toBe("Updated RTE Block Title");
    });

    it("should return error with available blocks when RTE block not found", async () => {
      // Arrange
      const { docTypeId } = await createRteInfrastructure();
      const blockKey = uuidv4();
      const rteValue = createRteValueWithBlocks([
        { key: blockKey, rteBlockTitle: "Test RTE Block" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("richContent", rteValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "richContent",
          updates: [{
            contentKey: FAKE_CONTENT_KEY,
            blockType: "content",
            properties: [{ alias: "rteBlockTitle", value: "Test" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the original block was not modified
      const blockValue = await getBlockPropertyValue(docBuilder.getId(), "richContent") as {
        blocks: {
          contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
        }
      };
      const originalBlock = blockValue.blocks.contentData.find(b => b.key === blockKey);
      const originalProperty = originalBlock?.values.find(v => v.alias === "rteBlockTitle");
      expect(originalProperty?.value).toBe("Test RTE Block");
    });

    it("should batch update multiple RTE blocks in single call", async () => {
      // Arrange
      const { docTypeId } = await createRteInfrastructure();
      const blockKey1 = uuidv4();
      const blockKey2 = uuidv4();
      const rteValue = createRteValueWithBlocks([
        { key: blockKey1, rteBlockTitle: "RTE Block 1" },
        { key: blockKey2, rteBlockTitle: "RTE Block 2" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("richContent", rteValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "richContent",
          updates: [
            {
              contentKey: blockKey1,
              blockType: "content",
              properties: [{ alias: "rteBlockTitle", value: "Updated RTE Block 1" }]
            },
            {
              contentKey: blockKey2,
              blockType: "content",
              properties: [{ alias: "rteBlockTitle", value: "Updated RTE Block 2" }]
            }
          ]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify both blocks were updated
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "richContent") as {
        blocks: {
          contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
        }
      };

      const updatedBlock1 = updatedBlockValue.blocks.contentData.find(b => b.key === blockKey1);
      const updatedProperty1 = updatedBlock1?.values.find(v => v.alias === "rteBlockTitle");
      expect(updatedProperty1?.value).toBe("Updated RTE Block 1");

      const updatedBlock2 = updatedBlockValue.blocks.contentData.find(b => b.key === blockKey2);
      const updatedProperty2 = updatedBlock2?.values.find(v => v.alias === "rteBlockTitle");
      expect(updatedProperty2?.value).toBe("Updated RTE Block 2");
    });

    it("should return error when property not found in RTE block and not on Element Type", async () => {
      // Arrange
      const { docTypeId } = await createRteInfrastructure();
      const blockKey = uuidv4();
      const rteValue = createRteValueWithBlocks([
        { key: blockKey, rteBlockTitle: "Test RTE Block" }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("richContent", rteValue)
        .create();

      // Act
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "richContent",
          updates: [{
            contentKey: blockKey,
            blockType: "content",
            properties: [{ alias: NON_EXISTENT_PROPERTY_ALIAS, value: "Test" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response includes error
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the original block was not modified
      const blockValue = await getBlockPropertyValue(docBuilder.getId(), "richContent") as {
        blocks: {
          contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
        }
      };
      const originalBlock = blockValue.blocks.contentData.find(b => b.key === blockKey);
      const originalProperty = originalBlock?.values.find(v => v.alias === "rteBlockTitle");
      expect(originalProperty?.value).toBe("Test RTE Block");
    });
  });

  describe("RTE inside BlockGrid integration tests", () => {
    // Test constants for RTE inside BlockGrid
    const TEST_RTE_INNER_ELEMENT_TYPE_NAME = "_Test RTE Inner Block Element";
    const TEST_NESTED_RTE_DATA_TYPE_NAME = "_Test Nested RTE DataType";
    const TEST_GRID_ELEMENT_WITH_RTE_NAME = "_Test Grid Element With RTE";
    const TEST_BLOCK_GRID_WITH_RTE_DATA_TYPE_NAME = "_Test BlockGrid With RTE DataType";
    const TEST_DOC_TYPE_WITH_RTE_IN_GRID_NAME = "_Test DocType With RTE In Grid";

    // Store created IDs for cleanup
    let rteInnerElementTypeId: string | null = null;
    let nestedRteDataTypeId: string | null = null;
    let gridElementWithRteId: string | null = null;
    let blockGridWithRteDataTypeId: string | null = null;
    let docTypeWithRteInGridId: string | null = null;

    beforeEach(async () => {
      // Clean up any leftover test data from previous failed runs
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_RTE_IN_GRID_NAME);
      await DataTypeTestHelper.cleanup(TEST_BLOCK_GRID_WITH_RTE_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_GRID_ELEMENT_WITH_RTE_NAME);
      await DataTypeTestHelper.cleanup(TEST_NESTED_RTE_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_RTE_INNER_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      // Clean up in reverse order of dependencies
      await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);

      if (docTypeWithRteInGridId) {
        await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_WITH_RTE_IN_GRID_NAME);
        docTypeWithRteInGridId = null;
      }
      if (blockGridWithRteDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_BLOCK_GRID_WITH_RTE_DATA_TYPE_NAME);
        blockGridWithRteDataTypeId = null;
      }
      if (gridElementWithRteId) {
        await DocumentTypeTestHelper.cleanup(TEST_GRID_ELEMENT_WITH_RTE_NAME);
        gridElementWithRteId = null;
      }
      if (nestedRteDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_NESTED_RTE_DATA_TYPE_NAME);
        nestedRteDataTypeId = null;
      }
      if (rteInnerElementTypeId) {
        await DocumentTypeTestHelper.cleanup(TEST_RTE_INNER_ELEMENT_TYPE_NAME);
        rteInnerElementTypeId = null;
      }
    });

    /**
     * Creates test infrastructure for RTE inside BlockGrid:
     * 1. Inner element type (for blocks inside the RTE)
     * 2. RTE data type (configured with inner element)
     * 3. Grid element type (with an RTE property)
     * 4. BlockGrid data type (configured with grid element)
     * 5. Document type (with BlockGrid property)
     */
    async function createRteInBlockGridInfrastructure(): Promise<{
      rteInnerElementTypeId: string;
      nestedRteDataTypeId: string;
      gridElementId: string;
      blockGridDataTypeId: string;
      docTypeId: string;
    }> {
      // 1. Create inner element type for the RTE blocks
      const innerElementResult = await CreateElementTypeTool.handler({
        name: TEST_RTE_INNER_ELEMENT_TYPE_NAME,
        alias: TEST_RTE_INNER_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-document",
        compositions: [],
        properties: [
          {
            name: "Inner RTE Title",
            alias: "innerRteTitle",
            dataTypeId: TextString_DATA_TYPE_ID,
            group: "Content"
          }
        ]
      }, createMockRequestHandlerExtra());

      const innerElementResponse = validateStructuredContent(innerElementResult, createElementTypeOutputSchema);
      if (!innerElementResponse.id) {
        throw new Error(`Failed to create inner element type: ${JSON.stringify(innerElementResponse)}`);
      }
      rteInnerElementTypeId = innerElementResponse.id;

      // 2. Create RTE data type for the nested RTE blocks
      const nestedRteBuilder = await new DataTypeBuilder()
        .withName(TEST_NESTED_RTE_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.RichText")
        .withEditorUiAlias("Umb.PropertyEditorUi.Tiptap")
        .withValue("blocks", [
          {
            contentElementTypeKey: rteInnerElementTypeId,
            label: "Inner RTE Block"
          }
        ])
        .create();
      nestedRteDataTypeId = nestedRteBuilder.getId();

      // 3. Create grid element type that contains the RTE property
      const gridElementResult = await CreateElementTypeTool.handler({
        name: TEST_GRID_ELEMENT_WITH_RTE_NAME,
        alias: TEST_GRID_ELEMENT_WITH_RTE_NAME.toLowerCase().replace(/\s+/g, ""),
        icon: "icon-grid",
        compositions: [],
        properties: [
          {
            name: "Grid Section Title",
            alias: "gridSectionTitle",
            dataTypeId: TextString_DATA_TYPE_ID,
            group: "Content"
          },
          {
            name: "Rich Text Content",
            alias: "richTextContent",
            dataTypeId: nestedRteDataTypeId,
            group: "Content"
          }
        ]
      }, createMockRequestHandlerExtra());

      const gridElementResponse = validateStructuredContent(gridElementResult, createElementTypeOutputSchema);
      if (!gridElementResponse.id) {
        throw new Error(`Failed to create grid element type: ${JSON.stringify(gridElementResponse)}`);
      }
      gridElementWithRteId = gridElementResponse.id;

      // 4. Create BlockGrid data type configured with the grid element
      const blockGridBuilder = await new DataTypeBuilder()
        .withName(TEST_BLOCK_GRID_WITH_RTE_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockGrid")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockGrid")
        .withValue("blocks", [
          {
            contentElementTypeKey: gridElementWithRteId,
            label: "Grid Section With RTE",
            columnSpanOptions: [],
            rowMinSpan: 1,
            rowMaxSpan: 1,
            allowAtRoot: true,
            allowInAreas: true
          }
        ])
        .create();
      blockGridWithRteDataTypeId = blockGridBuilder.getId();

      // 5. Create document type with the BlockGrid property
      const docTypeBuilder = await new DocumentTypeBuilder()
        .withName(TEST_DOC_TYPE_WITH_RTE_IN_GRID_NAME)
        .allowAsRoot(true)
        .withProperty("gridWithRte", "Grid With RTE", blockGridWithRteDataTypeId)
        .create();
      docTypeWithRteInGridId = docTypeBuilder.getId();

      return {
        rteInnerElementTypeId: rteInnerElementTypeId!,
        nestedRteDataTypeId: nestedRteDataTypeId!,
        gridElementId: gridElementWithRteId!,
        blockGridDataTypeId: blockGridWithRteDataTypeId!,
        docTypeId: docTypeWithRteInGridId!
      };
    }

    /**
     * Creates a BlockGrid value with RTE containing nested blocks
     */
    function createBlockGridValueWithRte(
      gridBlocks: Array<{
        key: string;
        gridSectionTitle: string;
        rteBlocks: Array<{ key: string; innerRteTitle: string }>;
      }>
    ): object {
      // Collect all inner block keys for the expose array
      const allInnerBlocks = gridBlocks.flatMap(gb => gb.rteBlocks);

      return {
        layout: {
          "Umbraco.BlockGrid": gridBlocks.map(gb => ({
            contentKey: gb.key,
            columnSpan: 12,
            rowSpan: 1,
            areas: []
          }))
        },
        contentData: gridBlocks.map(gb => ({
          key: gb.key,
          contentTypeKey: gridElementWithRteId,
          values: [
            { alias: "gridSectionTitle", value: gb.gridSectionTitle },
            {
              alias: "richTextContent",
              value: {
                markup: "<p>Rich text with blocks inside grid</p>",
                blocks: {
                  layout: {
                    "Umbraco.RichText": gb.rteBlocks.map(rb => ({ contentKey: rb.key }))
                  },
                  contentData: gb.rteBlocks.map(rb => ({
                    key: rb.key,
                    contentTypeKey: rteInnerElementTypeId,
                    values: [
                      { alias: "innerRteTitle", value: rb.innerRteTitle }
                    ]
                  })),
                  settingsData: [],
                  expose: gb.rteBlocks.map(rb => ({ contentKey: rb.key, culture: null, segment: null }))
                }
              }
            }
          ]
        })),
        settingsData: [],
        expose: [
          ...gridBlocks.map(gb => ({ contentKey: gb.key, culture: null, segment: null })),
          ...allInnerBlocks.map(rb => ({ contentKey: rb.key, culture: null, segment: null }))
        ]
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

    it("should update property in RTE block nested within BlockGrid", async () => {
      // Arrange
      const { docTypeId } = await createRteInBlockGridInfrastructure();
      const gridBlockKey = uuidv4();
      const rteBlockKey = uuidv4();

      const blockGridValue = createBlockGridValueWithRte([
        {
          key: gridBlockKey,
          gridSectionTitle: "Grid Section 1",
          rteBlocks: [
            { key: rteBlockKey, innerRteTitle: "Original Inner RTE Title" }
          ]
        }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("gridWithRte", blockGridValue)
        .create();

      // Act - Update the RTE block's property (deep traversal test)
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "gridWithRte",
          updates: [{
            contentKey: rteBlockKey,
            blockType: "content",
            properties: [{ alias: "innerRteTitle", value: "Updated Inner RTE Title" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the update persisted in the nested RTE structure
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "gridWithRte") as {
        contentData: Array<{
          key: string;
          values: Array<{
            alias: string;
            value: {
              blocks: {
                contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
              }
            }
          }>
        }>
      };

      const gridBlock = updatedBlockValue.contentData.find(b => b.key === gridBlockKey);
      const rteProperty = gridBlock?.values.find(v => v.alias === "richTextContent");
      const rteBlock = rteProperty?.value.blocks.contentData.find(b => b.key === rteBlockKey);
      const updatedProperty = rteBlock?.values.find(v => v.alias === "innerRteTitle");
      expect(updatedProperty?.value).toBe("Updated Inner RTE Title");
    });

    it("should update both grid block and nested RTE block in same call", async () => {
      // Arrange
      const { docTypeId } = await createRteInBlockGridInfrastructure();
      const gridBlockKey = uuidv4();
      const rteBlockKey = uuidv4();

      const blockGridValue = createBlockGridValueWithRte([
        {
          key: gridBlockKey,
          gridSectionTitle: "Original Grid Section",
          rteBlocks: [
            { key: rteBlockKey, innerRteTitle: "Original Inner RTE Title" }
          ]
        }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("gridWithRte", blockGridValue)
        .create();

      // Act - Update both grid block and RTE block in single call
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "gridWithRte",
          updates: [
            {
              contentKey: gridBlockKey,
              blockType: "content",
              properties: [{ alias: "gridSectionTitle", value: "Updated Grid Section" }]
            },
            {
              contentKey: rteBlockKey,
              blockType: "content",
              properties: [{ alias: "innerRteTitle", value: "Updated Inner RTE Title" }]
            }
          ]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify both updates persisted
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "gridWithRte") as {
        contentData: Array<{
          key: string;
          values: Array<{
            alias: string;
            value: any;
          }>
        }>
      };

      // Check grid block update
      const gridBlock = updatedBlockValue.contentData.find(b => b.key === gridBlockKey);
      const gridTitleProperty = gridBlock?.values.find(v => v.alias === "gridSectionTitle");
      expect(gridTitleProperty?.value).toBe("Updated Grid Section");

      // Check RTE block update
      const rteProperty = gridBlock?.values.find(v => v.alias === "richTextContent");
      const rteBlock = rteProperty?.value.blocks.contentData.find((b: { key: string }) => b.key === rteBlockKey);
      const innerTitleProperty = rteBlock?.values.find((v: { alias: string }) => v.alias === "innerRteTitle");
      expect(innerTitleProperty?.value).toBe("Updated Inner RTE Title");
    });

    it("should update multiple RTE blocks across different grid blocks", async () => {
      // Arrange
      const { docTypeId } = await createRteInBlockGridInfrastructure();
      const gridBlockKey1 = uuidv4();
      const gridBlockKey2 = uuidv4();
      const rteBlockKey1 = uuidv4();
      const rteBlockKey2 = uuidv4();

      const blockGridValue = createBlockGridValueWithRte([
        {
          key: gridBlockKey1,
          gridSectionTitle: "Grid Section 1",
          rteBlocks: [
            { key: rteBlockKey1, innerRteTitle: "RTE Block 1" }
          ]
        },
        {
          key: gridBlockKey2,
          gridSectionTitle: "Grid Section 2",
          rteBlocks: [
            { key: rteBlockKey2, innerRteTitle: "RTE Block 2" }
          ]
        }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("gridWithRte", blockGridValue)
        .create();

      // Act - Update RTE blocks from both grid sections
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "gridWithRte",
          updates: [
            {
              contentKey: rteBlockKey1,
              blockType: "content",
              properties: [{ alias: "innerRteTitle", value: "Updated RTE Block 1" }]
            },
            {
              contentKey: rteBlockKey2,
              blockType: "content",
              properties: [{ alias: "innerRteTitle", value: "Updated RTE Block 2" }]
            }
          ]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify both RTE blocks were updated
      const updatedBlockValue = await getBlockPropertyValue(docBuilder.getId(), "gridWithRte") as {
        contentData: Array<{
          key: string;
          values: Array<{
            alias: string;
            value: {
              blocks: {
                contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
              }
            }
          }>
        }>
      };

      // Check first RTE block
      const gridBlock1 = updatedBlockValue.contentData.find(b => b.key === gridBlockKey1);
      const rteProperty1 = gridBlock1?.values.find(v => v.alias === "richTextContent");
      const rteBlock1 = rteProperty1?.value.blocks.contentData.find(b => b.key === rteBlockKey1);
      expect(rteBlock1?.values.find(v => v.alias === "innerRteTitle")?.value).toBe("Updated RTE Block 1");

      // Check second RTE block
      const gridBlock2 = updatedBlockValue.contentData.find(b => b.key === gridBlockKey2);
      const rteProperty2 = gridBlock2?.values.find(v => v.alias === "richTextContent");
      const rteBlock2 = rteProperty2?.value.blocks.contentData.find(b => b.key === rteBlockKey2);
      expect(rteBlock2?.values.find(v => v.alias === "innerRteTitle")?.value).toBe("Updated RTE Block 2");
    });

    it("should return error when property not found in nested RTE block and not on Element Type", async () => {
      // Arrange
      const { docTypeId } = await createRteInBlockGridInfrastructure();
      const gridBlockKey = uuidv4();
      const rteBlockKey = uuidv4();

      const blockGridValue = createBlockGridValueWithRte([
        {
          key: gridBlockKey,
          gridSectionTitle: "Grid Section 1",
          rteBlocks: [
            { key: rteBlockKey, innerRteTitle: "Test RTE Block" }
          ]
        }
      ]);

      const docBuilder = await new DocumentBuilder()
        .withName(TEST_DOCUMENT_NAME)
        .withDocumentType(docTypeId)
        .withValue("gridWithRte", blockGridValue)
        .create();

      // Act - Try to update a non-existent property
      const result = await UpdateBlockPropertyTool.handler(
        {
          documentId: docBuilder.getId(),
          propertyAlias: "gridWithRte",
          updates: [{
            contentKey: rteBlockKey,
            blockType: "content",
            properties: [{ alias: NON_EXISTENT_PROPERTY_ALIAS, value: "Test" }]
          }]
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response includes error
      expect(createSnapshotResult(result, docBuilder.getId())).toMatchSnapshot();

      // Assert - Verify the original block was not modified
      const blockValue = await getBlockPropertyValue(docBuilder.getId(), "gridWithRte") as {
        contentData: Array<{
          key: string;
          values: Array<{
            alias: string;
            value: {
              blocks: {
                contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>
              }
            }
          }>
        }>
      };
      const gridBlock = blockValue.contentData.find(b => b.key === gridBlockKey);
      const rteProperty = gridBlock?.values.find(v => v.alias === "richTextContent");
      const rteBlock = rteProperty?.value.blocks.contentData.find(b => b.key === rteBlockKey);
      const originalProperty = rteBlock?.values.find(v => v.alias === "innerRteTitle");
      expect(originalProperty?.value).toBe("Test RTE Block");
    });
  });
});
