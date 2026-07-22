import UpdateElementBlockPropertyTool from "../put/update-element-block-property.js";
import UpdateElementPropertiesTool from "../put/update-element-properties.js";
import { ElementBuilder } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import CreateElementTypeTool from "../../document-type/post/create-element-type.js";
import { TextString_DATA_TYPE_ID } from "../../../../constants/constants.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { v4 as uuidv4 } from "uuid";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

// Test constants
const TEST_ELEMENT_NAME = "_Test Block Property Element";
const TEST_BLOCK_ELEMENT_TYPE_NAME = "_Test Block Content Element Type";
const TEST_BLOCK_LIST_DATA_TYPE_NAME = "_Test EL BlockList DataType";
const TEST_ELEMENT_TYPE_WITH_BLOCKS_NAME = "_Test ElementType With Blocks";
const INVALID_ALIAS = "nonExistentProperty";
const FAKE_CONTENT_KEY = "00000000-0000-0000-0000-000000000001";
const NON_EXISTENT_PROPERTY_ALIAS = "nonExistentPropertyAlias";

/**
 * Shape of the update-element-block-property success result.
 */
type BlockUpdateResponse = {
  success: boolean;
  message: string;
  results: Array<{
    success: boolean;
    contentKey: string;
    message: string;
    updatedCount?: number;
    addedCount?: number;
    warnings?: string[];
    errors?: string[];
  }>;
};

/**
 * Seeds a block value onto an element via update-element-properties.
 * Elements created from a freshly-created element type in Umbraco 18 do not
 * accept values at creation time, so the block value is added afterwards.
 */
async function seedElementBlockValue(
  elementId: string,
  propertyAlias: string,
  value: unknown
): Promise<void> {
  await UpdateElementPropertiesTool.handler(
    {
      id: elementId,
      properties: [{ alias: propertyAlias, value }],
    },
    createMockRequestHandlerExtra()
  );
}

/**
 * Helper to get a block property value from an element.
 */
async function getBlockPropertyValue(
  elementId: string,
  propertyAlias: string
): Promise<unknown> {
  const client = UmbracoManagementClient.getClient();
  const element = await client.getElementById(elementId);
  const property = element.values.find((v) => v.alias === propertyAlias);
  return property?.value;
}

describe("update-element-block-property", () => {
  setupTestEnvironment();

  describe("error handling integration tests", () => {
    const TEST_SIMPLE_ELEMENT_TYPE_NAME = "_Test Simple Element Type";
    let simpleElementTypeId: string | null = null;

    beforeEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_SIMPLE_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      if (simpleElementTypeId) {
        await DocumentTypeTestHelper.cleanup(TEST_SIMPLE_ELEMENT_TYPE_NAME);
        simpleElementTypeId = null;
      }
    });

    async function createSimpleElement(): Promise<string> {
      const builder = await new DocumentTypeBuilder()
        .withName(TEST_SIMPLE_ELEMENT_TYPE_NAME)
        .allowAsRoot(true)
        .asElement(true)
        .withProperty("title", "Title", TextString_DATA_TYPE_ID)
        .create();
      simpleElementTypeId = builder.getId();

      const elementBuilder = await new ElementBuilder()
        .withName(TEST_ELEMENT_NAME)
        .withDocumentType(simpleElementTypeId)
        .create();

      await seedElementBlockValue(elementBuilder.getId(), "title", "Simple Text Value");
      return elementBuilder.getId();
    }

    it("should return error for non-existent element property", async () => {
      // Arrange
      const elementId = await createSimpleElement();

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: INVALID_ALIAS,
          updates: [
            {
              contentKey: uuidv4(),
              blockType: "content",
              properties: [{ alias: "title", value: "Updated" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert
      expect(result.isError).toBe(true);
      expect((result.structuredContent as { title: string }).title).toBe("Property not found");
    });

    it("should return error for property without block structure", async () => {
      // Arrange
      const elementId = await createSimpleElement();

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "title",
          updates: [
            {
              contentKey: uuidv4(),
              blockType: "content",
              properties: [{ alias: "someAlias", value: "Updated" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert
      expect(result.isError).toBe(true);
      expect((result.structuredContent as { title: string }).title).toBe("No block structure found");
    });

    it("should handle non-existent element", async () => {
      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId: BLANK_UUID,
          propertyAlias: "someProperty",
          updates: [
            {
              contentKey: uuidv4(),
              blockType: "content",
              properties: [{ alias: "title", value: "Updated" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert
      expect(result.isError).toBe(true);
    });
  });

  describe("BlockList integration tests", () => {
    let blockElementTypeId: string | null = null;
    let blockListDataTypeId: string | null = null;
    let containerElementTypeId: string | null = null;

    beforeEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_WITH_BLOCKS_NAME);
      await DataTypeTestHelper.cleanup(TEST_BLOCK_LIST_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_BLOCK_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      if (containerElementTypeId) {
        await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_WITH_BLOCKS_NAME);
        containerElementTypeId = null;
      }
      if (blockListDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_BLOCK_LIST_DATA_TYPE_NAME);
        blockListDataTypeId = null;
      }
      if (blockElementTypeId) {
        await DocumentTypeTestHelper.cleanup(TEST_BLOCK_ELEMENT_TYPE_NAME);
        blockElementTypeId = null;
      }
    });

    async function createBlockListInfrastructure(): Promise<{
      blockElementTypeId: string;
      containerElementTypeId: string;
    }> {
      // 1. Element type used for the blocks themselves
      const elementResult = await CreateElementTypeTool.handler(
        {
          name: TEST_BLOCK_ELEMENT_TYPE_NAME,
          alias: TEST_BLOCK_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
          icon: "icon-document",
          compositions: [],
          properties: [
            {
              name: "Block Title",
              alias: "blockTitle",
              dataTypeId: TextString_DATA_TYPE_ID,
              group: "Content",
            },
          ],
          description: undefined,
          allowedInLibrary: false,
        },
        createMockRequestHandlerExtra()
      );

      const elementResponse = validateToolResponse(CreateElementTypeTool, elementResult);
      if (!elementResponse.id) {
        throw new Error(`Failed to create element type: ${JSON.stringify(elementResponse)}`);
      }
      blockElementTypeId = elementResponse.id;

      // 2. BlockList data type using that element type
      const blockListBuilder = await new DataTypeBuilder()
        .withName(TEST_BLOCK_LIST_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockList")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockList")
        .withValue("blocks", [
          {
            contentElementTypeKey: blockElementTypeId,
            label: "Test Block",
          },
        ])
        .create();
      blockListDataTypeId = blockListBuilder.getId();

      // 3. Container element type with the BlockList property
      const containerBuilder = await new DocumentTypeBuilder()
        .withName(TEST_ELEMENT_TYPE_WITH_BLOCKS_NAME)
        .allowAsRoot(true)
        .asElement(true)
        .withProperty("blocks", "Blocks", blockListDataTypeId)
        .create();
      containerElementTypeId = containerBuilder.getId();

      return {
        blockElementTypeId: blockElementTypeId!,
        containerElementTypeId: containerElementTypeId!,
      };
    }

    function createBlockListValue(
      blocks: Array<{ key: string; blockTitle: string }>
    ): object {
      return {
        layout: {
          "Umbraco.BlockList": blocks.map((b) => ({ contentKey: b.key })),
        },
        contentData: blocks.map((b) => ({
          key: b.key,
          contentTypeKey: blockElementTypeId,
          values: [{ alias: "blockTitle", value: b.blockTitle }],
        })),
        settingsData: [],
        expose: blocks.map((b) => ({ contentKey: b.key, culture: null, segment: null })),
      };
    }

    async function createSeededElement(
      containerId: string,
      blockValue: object
    ): Promise<string> {
      const elementBuilder = await new ElementBuilder()
        .withName(TEST_ELEMENT_NAME)
        .withDocumentType(containerId)
        .create();
      await seedElementBlockValue(elementBuilder.getId(), "blocks", blockValue);
      return elementBuilder.getId();
    }

    it("should update property in BlockList content block", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createBlockListInfrastructure();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockListValue([{ key: blockKey, blockTitle: "Original Title" }])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "blocks",
          updates: [
            {
              contentKey: blockKey,
              blockType: "content",
              properties: [{ alias: "blockTitle", value: "Updated Title" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results).toHaveLength(1);
      expect(response.results[0].contentKey).toBe(blockKey);
      expect(response.results[0].success).toBe(true);
      expect(response.results[0].updatedCount).toBe(1);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "blocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>;
      };
      const updatedBlock = updatedBlockValue.contentData.find((b) => b.key === blockKey);
      expect(updatedBlock?.values.find((v) => v.alias === "blockTitle")?.value).toBe("Updated Title");
    });

    it("should return error with available blocks when block not found", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createBlockListInfrastructure();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockListValue([{ key: blockKey, blockTitle: "Test Block" }])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "blocks",
          updates: [
            {
              contentKey: FAKE_CONTENT_KEY,
              blockType: "content",
              properties: [{ alias: "blockTitle", value: "Test" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - thrown validation error (all blocks not found)
      expect(result.isError).toBe(true);
      expect((result.structuredContent as { title: string }).title).toBe("Blocks not found");

      // Assert - original block unchanged
      const blockValue = (await getBlockPropertyValue(elementId, "blocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>;
      };
      const originalBlock = blockValue.contentData.find((b) => b.key === blockKey);
      expect(originalBlock?.values.find((v) => v.alias === "blockTitle")?.value).toBe("Test Block");
    });

    it("should batch update multiple blocks in single call", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createBlockListInfrastructure();
      const blockKey1 = uuidv4();
      const blockKey2 = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockListValue([
          { key: blockKey1, blockTitle: "Block 1" },
          { key: blockKey2, blockTitle: "Block 2" },
        ])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "blocks",
          updates: [
            {
              contentKey: blockKey1,
              blockType: "content",
              properties: [{ alias: "blockTitle", value: "Updated Block 1" }],
            },
            {
              contentKey: blockKey2,
              blockType: "content",
              properties: [{ alias: "blockTitle", value: "Updated Block 2" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results).toHaveLength(2);
      expect(response.results.every((r) => r.updatedCount === 1)).toBe(true);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "blocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>;
      };
      const updatedBlock1 = updatedBlockValue.contentData.find((b) => b.key === blockKey1);
      expect(updatedBlock1?.values.find((v) => v.alias === "blockTitle")?.value).toBe("Updated Block 1");
      const updatedBlock2 = updatedBlockValue.contentData.find((b) => b.key === blockKey2);
      expect(updatedBlock2?.values.find((v) => v.alias === "blockTitle")?.value).toBe("Updated Block 2");
    });

    it("should report error when property not found in block and not on Element Type", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createBlockListInfrastructure();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockListValue([{ key: blockKey, blockTitle: "Test Block" }])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "blocks",
          updates: [
            {
              contentKey: blockKey,
              blockType: "content",
              properties: [{ alias: NON_EXISTENT_PROPERTY_ALIAS, value: "Test" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - block found but property invalid -> per-result error, not a thrown error
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.results[0].success).toBe(false);
      expect(response.results[0].errors?.some((e) => e.includes("does not exist on Element Type"))).toBe(true);

      // Assert - original block unchanged
      const blockValue = (await getBlockPropertyValue(elementId, "blocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>;
      };
      const originalBlock = blockValue.contentData.find((b) => b.key === blockKey);
      expect(originalBlock?.values.find((v) => v.alias === "blockTitle")?.value).toBe("Test Block");
    });
  });

  describe("add new properties to blocks", () => {
    const TEST_ELEMENT_TYPE_EXTRA_NAME = "_Test Block Element Extra Props EL";
    const TEST_BLOCK_LIST_EXTRA_DATA_TYPE_NAME = "_Test EL BlockList Extra DataType";
    const TEST_CONTAINER_EXTRA_NAME = "_Test ElementType Extra Blocks";

    let elementTypeExtraId: string | null = null;
    let blockListExtraDataTypeId: string | null = null;
    let containerExtraId: string | null = null;

    beforeEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_CONTAINER_EXTRA_NAME);
      await DataTypeTestHelper.cleanup(TEST_BLOCK_LIST_EXTRA_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_EXTRA_NAME);
    });

    afterEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      if (containerExtraId) {
        await DocumentTypeTestHelper.cleanup(TEST_CONTAINER_EXTRA_NAME);
        containerExtraId = null;
      }
      if (blockListExtraDataTypeId) {
        await DataTypeTestHelper.cleanup(TEST_BLOCK_LIST_EXTRA_DATA_TYPE_NAME);
        blockListExtraDataTypeId = null;
      }
      if (elementTypeExtraId) {
        await DocumentTypeTestHelper.cleanup(TEST_ELEMENT_TYPE_EXTRA_NAME);
        elementTypeExtraId = null;
      }
    });

    async function createBlockListWithExtraProperties(): Promise<{
      blockElementTypeId: string;
      containerElementTypeId: string;
    }> {
      const elementResult = await CreateElementTypeTool.handler(
        {
          name: TEST_ELEMENT_TYPE_EXTRA_NAME,
          alias: TEST_ELEMENT_TYPE_EXTRA_NAME.toLowerCase().replace(/\s+/g, ""),
          icon: "icon-document",
          compositions: [],
          properties: [
            {
              name: "Block Title",
              alias: "blockTitle",
              dataTypeId: TextString_DATA_TYPE_ID,
              group: "Content",
            },
            {
              name: "Block Subtitle",
              alias: "blockSubtitle",
              dataTypeId: TextString_DATA_TYPE_ID,
              group: "Content",
            },
          ],
          description: undefined,
          allowedInLibrary: false,
        },
        createMockRequestHandlerExtra()
      );

      const elementResponse = validateToolResponse(CreateElementTypeTool, elementResult);
      if (!elementResponse.id) {
        throw new Error(`Failed to create element type: ${JSON.stringify(elementResponse)}`);
      }
      elementTypeExtraId = elementResponse.id;

      const blockListBuilder = await new DataTypeBuilder()
        .withName(TEST_BLOCK_LIST_EXTRA_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockList")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockList")
        .withValue("blocks", [
          {
            contentElementTypeKey: elementTypeExtraId,
            label: "Test Block With Extra",
          },
        ])
        .create();
      blockListExtraDataTypeId = blockListBuilder.getId();

      const containerBuilder = await new DocumentTypeBuilder()
        .withName(TEST_CONTAINER_EXTRA_NAME)
        .allowAsRoot(true)
        .asElement(true)
        .withProperty("blocks", "Blocks", blockListExtraDataTypeId)
        .create();
      containerExtraId = containerBuilder.getId();

      return {
        blockElementTypeId: elementTypeExtraId!,
        containerElementTypeId: containerExtraId!,
      };
    }

    function createBlockListValueWithoutSubtitle(
      blocks: Array<{ key: string; blockTitle: string }>,
      contentTypeKey: string
    ): object {
      return {
        layout: {
          "Umbraco.BlockList": blocks.map((b) => ({ contentKey: b.key })),
        },
        contentData: blocks.map((b) => ({
          key: b.key,
          contentTypeKey: contentTypeKey,
          values: [{ alias: "blockTitle", value: b.blockTitle }],
        })),
        settingsData: [],
        expose: blocks.map((b) => ({ contentKey: b.key, culture: null, segment: null })),
      };
    }

    async function createSeededElement(
      containerId: string,
      blockValue: object
    ): Promise<string> {
      const elementBuilder = await new ElementBuilder()
        .withName(TEST_ELEMENT_NAME)
        .withDocumentType(containerId)
        .create();
      await seedElementBlockValue(elementBuilder.getId(), "blocks", blockValue);
      return elementBuilder.getId();
    }

    it("should add new property that exists on Element Type but not on block", async () => {
      // Arrange
      const { blockElementTypeId: contentTypeKey, containerElementTypeId: containerId } =
        await createBlockListWithExtraProperties();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockListValueWithoutSubtitle(
          [{ key: blockKey, blockTitle: "Original Title" }],
          contentTypeKey
        )
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "blocks",
          updates: [
            {
              contentKey: blockKey,
              blockType: "content",
              properties: [{ alias: "blockSubtitle", value: "New Subtitle" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results[0].addedCount).toBe(1);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "blocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>;
      };
      const updatedBlock = updatedBlockValue.contentData.find((b) => b.key === blockKey);
      expect(updatedBlock?.values.find((v) => v.alias === "blockSubtitle")?.value).toBe("New Subtitle");
      expect(updatedBlock?.values.find((v) => v.alias === "blockTitle")?.value).toBe("Original Title");
    });

    it("should mix update and add in single block call", async () => {
      // Arrange
      const { blockElementTypeId: contentTypeKey, containerElementTypeId: containerId } =
        await createBlockListWithExtraProperties();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockListValueWithoutSubtitle(
          [{ key: blockKey, blockTitle: "Original Title" }],
          contentTypeKey
        )
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "blocks",
          updates: [
            {
              contentKey: blockKey,
              blockType: "content",
              properties: [
                { alias: "blockTitle", value: "Updated Title" },
                { alias: "blockSubtitle", value: "New Subtitle" },
              ],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results[0].updatedCount).toBe(1);
      expect(response.results[0].addedCount).toBe(1);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "blocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>;
      };
      const updatedBlock = updatedBlockValue.contentData.find((b) => b.key === blockKey);
      expect(updatedBlock?.values.find((v) => v.alias === "blockTitle")?.value).toBe("Updated Title");
      expect(updatedBlock?.values.find((v) => v.alias === "blockSubtitle")?.value).toBe("New Subtitle");
    });

    it("should report error when property does not exist on Element Type", async () => {
      // Arrange
      const { blockElementTypeId: contentTypeKey, containerElementTypeId: containerId } =
        await createBlockListWithExtraProperties();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockListValueWithoutSubtitle(
          [{ key: blockKey, blockTitle: "Test Block" }],
          contentTypeKey
        )
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "blocks",
          updates: [
            {
              contentKey: blockKey,
              blockType: "content",
              properties: [{ alias: "nonExistentOnElementType", value: "Test" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.results[0].success).toBe(false);
      expect(response.results[0].errors?.some((e) => e.includes("does not exist on Element Type"))).toBe(true);
    });
  });

  describe("BlockGrid integration tests", () => {
    const TEST_BLOCK_GRID_ELEMENT_TYPE_NAME = "_Test EL BlockGrid Element Type";
    const TEST_BLOCK_GRID_DATA_TYPE_NAME = "_Test EL BlockGrid DataType";
    const TEST_CONTAINER_WITH_BLOCK_GRID_NAME = "_Test ElementType With BlockGrid";

    let blockGridElementTypeId: string | null = null;
    let blockGridDataTypeId: string | null = null;
    let containerWithBlockGridId: string | null = null;

    beforeEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_CONTAINER_WITH_BLOCK_GRID_NAME);
      await DataTypeTestHelper.cleanup(TEST_BLOCK_GRID_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_BLOCK_GRID_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      if (containerWithBlockGridId) {
        await DocumentTypeTestHelper.cleanup(TEST_CONTAINER_WITH_BLOCK_GRID_NAME);
        containerWithBlockGridId = null;
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

    async function createBlockGridInfrastructure(): Promise<{ containerElementTypeId: string }> {
      const elementResult = await CreateElementTypeTool.handler(
        {
          name: TEST_BLOCK_GRID_ELEMENT_TYPE_NAME,
          alias: TEST_BLOCK_GRID_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
          icon: "icon-document",
          compositions: [],
          properties: [
            {
              name: "Grid Block Title",
              alias: "gridBlockTitle",
              dataTypeId: TextString_DATA_TYPE_ID,
              group: "Content",
            },
          ],
          description: undefined,
          allowedInLibrary: false,
        },
        createMockRequestHandlerExtra()
      );

      const elementResponse = validateToolResponse(CreateElementTypeTool, elementResult);
      if (!elementResponse.id) {
        throw new Error(`Failed to create element type: ${JSON.stringify(elementResponse)}`);
      }
      blockGridElementTypeId = elementResponse.id;

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
            allowInAreas: true,
          },
        ])
        .create();
      blockGridDataTypeId = blockGridBuilder.getId();

      const containerBuilder = await new DocumentTypeBuilder()
        .withName(TEST_CONTAINER_WITH_BLOCK_GRID_NAME)
        .allowAsRoot(true)
        .asElement(true)
        .withProperty("gridBlocks", "Grid Blocks", blockGridDataTypeId)
        .create();
      containerWithBlockGridId = containerBuilder.getId();

      return { containerElementTypeId: containerWithBlockGridId! };
    }

    function createBlockGridValue(
      blocks: Array<{ key: string; gridBlockTitle: string }>
    ): object {
      return {
        layout: {
          "Umbraco.BlockGrid": blocks.map((b) => ({
            contentKey: b.key,
            columnSpan: 12,
            rowSpan: 1,
            areas: [],
          })),
        },
        contentData: blocks.map((b) => ({
          key: b.key,
          contentTypeKey: blockGridElementTypeId,
          values: [{ alias: "gridBlockTitle", value: b.gridBlockTitle }],
        })),
        settingsData: [],
        expose: blocks.map((b) => ({ contentKey: b.key, culture: null, segment: null })),
      };
    }

    async function createSeededElement(
      containerId: string,
      blockValue: object
    ): Promise<string> {
      const elementBuilder = await new ElementBuilder()
        .withName(TEST_ELEMENT_NAME)
        .withDocumentType(containerId)
        .create();
      await seedElementBlockValue(elementBuilder.getId(), "gridBlocks", blockValue);
      return elementBuilder.getId();
    }

    it("should update property in BlockGrid content block", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createBlockGridInfrastructure();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockGridValue([{ key: blockKey, gridBlockTitle: "Original Grid Title" }])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "gridBlocks",
          updates: [
            {
              contentKey: blockKey,
              blockType: "content",
              properties: [{ alias: "gridBlockTitle", value: "Updated Grid Title" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results[0].updatedCount).toBe(1);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "gridBlocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>;
      };
      const updatedBlock = updatedBlockValue.contentData.find((b) => b.key === blockKey);
      expect(updatedBlock?.values.find((v) => v.alias === "gridBlockTitle")?.value).toBe("Updated Grid Title");
    });

    it("should batch update multiple BlockGrid blocks in single call", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createBlockGridInfrastructure();
      const blockKey1 = uuidv4();
      const blockKey2 = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createBlockGridValue([
          { key: blockKey1, gridBlockTitle: "Grid Block 1" },
          { key: blockKey2, gridBlockTitle: "Grid Block 2" },
        ])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "gridBlocks",
          updates: [
            {
              contentKey: blockKey1,
              blockType: "content",
              properties: [{ alias: "gridBlockTitle", value: "Updated Grid Block 1" }],
            },
            {
              contentKey: blockKey2,
              blockType: "content",
              properties: [{ alias: "gridBlockTitle", value: "Updated Grid Block 2" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results).toHaveLength(2);
      expect(response.results.every((r) => r.updatedCount === 1)).toBe(true);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "gridBlocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }>;
      };
      const updatedBlock1 = updatedBlockValue.contentData.find((b) => b.key === blockKey1);
      expect(updatedBlock1?.values.find((v) => v.alias === "gridBlockTitle")?.value).toBe("Updated Grid Block 1");
      const updatedBlock2 = updatedBlockValue.contentData.find((b) => b.key === blockKey2);
      expect(updatedBlock2?.values.find((v) => v.alias === "gridBlockTitle")?.value).toBe("Updated Grid Block 2");
    });
  });

  describe("Nested BlockList within BlockGrid integration tests", () => {
    const TEST_INNER_ELEMENT_TYPE_NAME = "_Test EL Inner BlockList Element";
    const TEST_INNER_BLOCK_LIST_DATA_TYPE_NAME = "_Test EL Inner BlockList DataType";
    const TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME = "_Test EL Grid Element With BlockList";
    const TEST_NESTED_BLOCK_GRID_DATA_TYPE_NAME = "_Test EL Nested BlockGrid DataType";
    const TEST_CONTAINER_WITH_NESTED_BLOCKS_NAME = "_Test ElementType With Nested Blocks";

    let innerElementTypeId: string | null = null;
    let innerBlockListDataTypeId: string | null = null;
    let gridElementWithBlockListId: string | null = null;
    let nestedBlockGridDataTypeId: string | null = null;
    let containerWithNestedBlocksId: string | null = null;

    beforeEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_CONTAINER_WITH_NESTED_BLOCKS_NAME);
      await DataTypeTestHelper.cleanup(TEST_NESTED_BLOCK_GRID_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME);
      await DataTypeTestHelper.cleanup(TEST_INNER_BLOCK_LIST_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_INNER_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      if (containerWithNestedBlocksId) {
        await DocumentTypeTestHelper.cleanup(TEST_CONTAINER_WITH_NESTED_BLOCKS_NAME);
        containerWithNestedBlocksId = null;
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

    async function createNestedBlockInfrastructure(): Promise<{ containerElementTypeId: string }> {
      const innerElementResult = await CreateElementTypeTool.handler(
        {
          name: TEST_INNER_ELEMENT_TYPE_NAME,
          alias: TEST_INNER_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
          icon: "icon-document",
          compositions: [],
          properties: [
            {
              name: "Inner Title",
              alias: "innerTitle",
              dataTypeId: TextString_DATA_TYPE_ID,
              group: "Content",
            },
          ],
          description: undefined,
          allowedInLibrary: false,
        },
        createMockRequestHandlerExtra()
      );

      const innerElementResponse = validateToolResponse(CreateElementTypeTool, innerElementResult);
      if (!innerElementResponse.id) {
        throw new Error(`Failed to create inner element type: ${JSON.stringify(innerElementResponse)}`);
      }
      innerElementTypeId = innerElementResponse.id;

      const innerBlockListBuilder = await new DataTypeBuilder()
        .withName(TEST_INNER_BLOCK_LIST_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.BlockList")
        .withEditorUiAlias("Umb.PropertyEditorUi.BlockList")
        .withValue("blocks", [
          {
            contentElementTypeKey: innerElementTypeId,
            label: "Inner Block",
          },
        ])
        .create();
      innerBlockListDataTypeId = innerBlockListBuilder.getId();

      const gridElementResult = await CreateElementTypeTool.handler(
        {
          name: TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME,
          alias: TEST_GRID_ELEMENT_WITH_BLOCKLIST_NAME.toLowerCase().replace(/\s+/g, ""),
          icon: "icon-grid",
          compositions: [],
          properties: [
            {
              name: "Grid Section Title",
              alias: "gridSectionTitle",
              dataTypeId: TextString_DATA_TYPE_ID,
              group: "Content",
            },
            {
              name: "Nested Blocks",
              alias: "nestedBlocks",
              dataTypeId: innerBlockListDataTypeId,
              group: "Content",
            },
          ],
          description: undefined,
          allowedInLibrary: false,
        },
        createMockRequestHandlerExtra()
      );

      const gridElementResponse = validateToolResponse(CreateElementTypeTool, gridElementResult);
      if (!gridElementResponse.id) {
        throw new Error(`Failed to create grid element type: ${JSON.stringify(gridElementResponse)}`);
      }
      gridElementWithBlockListId = gridElementResponse.id;

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
            allowInAreas: true,
          },
        ])
        .create();
      nestedBlockGridDataTypeId = blockGridBuilder.getId();

      const containerBuilder = await new DocumentTypeBuilder()
        .withName(TEST_CONTAINER_WITH_NESTED_BLOCKS_NAME)
        .allowAsRoot(true)
        .asElement(true)
        .withProperty("nestedGridBlocks", "Nested Grid Blocks", nestedBlockGridDataTypeId)
        .create();
      containerWithNestedBlocksId = containerBuilder.getId();

      return { containerElementTypeId: containerWithNestedBlocksId! };
    }

    function createNestedBlockGridValue(
      gridBlocks: Array<{
        key: string;
        gridSectionTitle: string;
        nestedBlocks: Array<{ key: string; innerTitle: string }>;
      }>
    ): object {
      const allInnerBlocks = gridBlocks.flatMap((gb) => gb.nestedBlocks);

      return {
        layout: {
          "Umbraco.BlockGrid": gridBlocks.map((gb) => ({
            contentKey: gb.key,
            columnSpan: 12,
            rowSpan: 1,
            areas: [],
          })),
        },
        contentData: gridBlocks.map((gb) => ({
          key: gb.key,
          contentTypeKey: gridElementWithBlockListId,
          values: [
            { alias: "gridSectionTitle", value: gb.gridSectionTitle },
            {
              alias: "nestedBlocks",
              value: {
                layout: {
                  "Umbraco.BlockList": gb.nestedBlocks.map((nb) => ({ contentKey: nb.key })),
                },
                contentData: gb.nestedBlocks.map((nb) => ({
                  key: nb.key,
                  contentTypeKey: innerElementTypeId,
                  values: [{ alias: "innerTitle", value: nb.innerTitle }],
                })),
                settingsData: [],
                expose: gb.nestedBlocks.map((nb) => ({ contentKey: nb.key, culture: null, segment: null })),
              },
            },
          ],
        })),
        settingsData: [],
        expose: [
          ...gridBlocks.map((gb) => ({ contentKey: gb.key, culture: null, segment: null })),
          ...allInnerBlocks.map((nb) => ({ contentKey: nb.key, culture: null, segment: null })),
        ],
      };
    }

    async function createSeededElement(
      containerId: string,
      blockValue: object
    ): Promise<string> {
      const elementBuilder = await new ElementBuilder()
        .withName(TEST_ELEMENT_NAME)
        .withDocumentType(containerId)
        .create();
      await seedElementBlockValue(elementBuilder.getId(), "nestedGridBlocks", blockValue);
      return elementBuilder.getId();
    }

    it("should update property in nested BlockList block within BlockGrid", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createNestedBlockInfrastructure();
      const gridBlockKey = uuidv4();
      const innerBlockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createNestedBlockGridValue([
          {
            key: gridBlockKey,
            gridSectionTitle: "Grid Section 1",
            nestedBlocks: [{ key: innerBlockKey, innerTitle: "Original Inner Title" }],
          },
        ])
      );

      // Act - Update the inner block's property (deep traversal test)
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "nestedGridBlocks",
          updates: [
            {
              contentKey: innerBlockKey,
              blockType: "content",
              properties: [{ alias: "innerTitle", value: "Updated Inner Title" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results[0].updatedCount).toBe(1);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "nestedGridBlocks")) as {
        contentData: Array<{
          key: string;
          values: Array<{
            alias: string;
            value: { contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }> };
          }>;
        }>;
      };
      const gridBlock = updatedBlockValue.contentData.find((b) => b.key === gridBlockKey);
      const nestedBlocksProperty = gridBlock?.values.find((v) => v.alias === "nestedBlocks");
      const innerBlock = nestedBlocksProperty?.value.contentData.find((b) => b.key === innerBlockKey);
      expect(innerBlock?.values.find((v) => v.alias === "innerTitle")?.value).toBe("Updated Inner Title");
    });

    it("should update both grid block and nested block in same call", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createNestedBlockInfrastructure();
      const gridBlockKey = uuidv4();
      const innerBlockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createNestedBlockGridValue([
          {
            key: gridBlockKey,
            gridSectionTitle: "Original Grid Section",
            nestedBlocks: [{ key: innerBlockKey, innerTitle: "Original Inner Title" }],
          },
        ])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "nestedGridBlocks",
          updates: [
            {
              contentKey: gridBlockKey,
              blockType: "content",
              properties: [{ alias: "gridSectionTitle", value: "Updated Grid Section" }],
            },
            {
              contentKey: innerBlockKey,
              blockType: "content",
              properties: [{ alias: "innerTitle", value: "Updated Inner Title" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results).toHaveLength(2);
      expect(response.results.every((r) => r.updatedCount === 1)).toBe(true);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "nestedGridBlocks")) as {
        contentData: Array<{ key: string; values: Array<{ alias: string; value: any }> }>;
      };
      const gridBlock = updatedBlockValue.contentData.find((b) => b.key === gridBlockKey);
      expect(gridBlock?.values.find((v) => v.alias === "gridSectionTitle")?.value).toBe("Updated Grid Section");
      const nestedBlocksProperty = gridBlock?.values.find((v) => v.alias === "nestedBlocks");
      const innerBlock = nestedBlocksProperty?.value.contentData.find((b: { key: string }) => b.key === innerBlockKey);
      expect(innerBlock?.values.find((v: { alias: string }) => v.alias === "innerTitle")?.value).toBe("Updated Inner Title");
    });
  });

  describe("RichText Editor (RTE) integration tests", () => {
    const TEST_RTE_ELEMENT_TYPE_NAME = "_Test EL RTE Block Element Type";
    const TEST_RTE_DATA_TYPE_NAME = "_Test EL RTE DataType";
    const TEST_CONTAINER_WITH_RTE_NAME = "_Test ElementType With RTE";

    let rteElementTypeId: string | null = null;
    let rteDataTypeId: string | null = null;
    let containerWithRteId: string | null = null;

    beforeEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_CONTAINER_WITH_RTE_NAME);
      await DataTypeTestHelper.cleanup(TEST_RTE_DATA_TYPE_NAME);
      await DocumentTypeTestHelper.cleanup(TEST_RTE_ELEMENT_TYPE_NAME);
    });

    afterEach(async () => {
      await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
      if (containerWithRteId) {
        await DocumentTypeTestHelper.cleanup(TEST_CONTAINER_WITH_RTE_NAME);
        containerWithRteId = null;
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

    async function createRteInfrastructure(): Promise<{ containerElementTypeId: string }> {
      const elementResult = await CreateElementTypeTool.handler(
        {
          name: TEST_RTE_ELEMENT_TYPE_NAME,
          alias: TEST_RTE_ELEMENT_TYPE_NAME.toLowerCase().replace(/\s+/g, ""),
          icon: "icon-document",
          compositions: [],
          properties: [
            {
              name: "RTE Block Title",
              alias: "rteBlockTitle",
              dataTypeId: TextString_DATA_TYPE_ID,
              group: "Content",
            },
          ],
          description: undefined,
          allowedInLibrary: false,
        },
        createMockRequestHandlerExtra()
      );

      const elementResponse = validateToolResponse(CreateElementTypeTool, elementResult);
      if (!elementResponse.id) {
        throw new Error(`Failed to create element type: ${JSON.stringify(elementResponse)}`);
      }
      rteElementTypeId = elementResponse.id;

      const rteBuilder = await new DataTypeBuilder()
        .withName(TEST_RTE_DATA_TYPE_NAME)
        .withEditorAlias("Umbraco.RichText")
        .withEditorUiAlias("Umb.PropertyEditorUi.Tiptap")
        .withValue("blocks", [
          {
            contentElementTypeKey: rteElementTypeId,
            label: "RTE Block",
          },
        ])
        .create();
      rteDataTypeId = rteBuilder.getId();

      const containerBuilder = await new DocumentTypeBuilder()
        .withName(TEST_CONTAINER_WITH_RTE_NAME)
        .allowAsRoot(true)
        .asElement(true)
        .withProperty("richContent", "Rich Content", rteDataTypeId)
        .create();
      containerWithRteId = containerBuilder.getId();

      return { containerElementTypeId: containerWithRteId! };
    }

    function createRteValueWithBlocks(
      blocks: Array<{ key: string; rteBlockTitle: string }>
    ): object {
      return {
        markup: "<p>Rich text content with embedded blocks</p>",
        blocks: {
          layout: {
            "Umbraco.RichText": blocks.map((b) => ({ contentKey: b.key })),
          },
          contentData: blocks.map((b) => ({
            key: b.key,
            contentTypeKey: rteElementTypeId,
            values: [{ alias: "rteBlockTitle", value: b.rteBlockTitle }],
          })),
          settingsData: [],
          expose: blocks.map((b) => ({ contentKey: b.key, culture: null, segment: null })),
        },
      };
    }

    async function createSeededElement(
      containerId: string,
      blockValue: object
    ): Promise<string> {
      const elementBuilder = await new ElementBuilder()
        .withName(TEST_ELEMENT_NAME)
        .withDocumentType(containerId)
        .create();
      await seedElementBlockValue(elementBuilder.getId(), "richContent", blockValue);
      return elementBuilder.getId();
    }

    it("should update property in RTE block content", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createRteInfrastructure();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createRteValueWithBlocks([{ key: blockKey, rteBlockTitle: "Original RTE Block Title" }])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "richContent",
          updates: [
            {
              contentKey: blockKey,
              blockType: "content",
              properties: [{ alias: "rteBlockTitle", value: "Updated RTE Block Title" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert - handler response
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.success).toBe(true);
      expect(response.results[0].updatedCount).toBe(1);

      // Assert - persistence
      const updatedBlockValue = (await getBlockPropertyValue(elementId, "richContent")) as {
        blocks: { contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }> };
      };
      const updatedBlock = updatedBlockValue.blocks.contentData.find((b) => b.key === blockKey);
      expect(updatedBlock?.values.find((v) => v.alias === "rteBlockTitle")?.value).toBe("Updated RTE Block Title");
    });

    it("should report error when property not found in RTE block and not on Element Type", async () => {
      // Arrange
      const { containerElementTypeId: containerId } = await createRteInfrastructure();
      const blockKey = uuidv4();
      const elementId = await createSeededElement(
        containerId,
        createRteValueWithBlocks([{ key: blockKey, rteBlockTitle: "Test RTE Block" }])
      );

      // Act
      const result = await UpdateElementBlockPropertyTool.handler(
        {
          elementId,
          propertyAlias: "richContent",
          updates: [
            {
              contentKey: blockKey,
              blockType: "content",
              properties: [{ alias: NON_EXISTENT_PROPERTY_ALIAS, value: "Test" }],
            },
          ],
          culture: null,
          segment: null,
        },
        createMockRequestHandlerExtra()
      );

      // Assert
      const response = validateToolResponse(UpdateElementBlockPropertyTool, result) as BlockUpdateResponse;
      expect(response.results[0].success).toBe(false);
      expect(response.results[0].errors?.some((e) => e.includes("does not exist on Element Type"))).toBe(true);

      // Assert - persistence unchanged
      const blockValue = (await getBlockPropertyValue(elementId, "richContent")) as {
        blocks: { contentData: Array<{ key: string; values: Array<{ alias: string; value: string }> }> };
      };
      const originalBlock = blockValue.blocks.contentData.find((b) => b.key === blockKey);
      expect(originalBlock?.values.find((v) => v.alias === "rteBlockTitle")?.value).toBe("Test RTE Block");
    });
  });
});
