import CreateDocumentBlockTool, { createDocumentBlockOutputSchema } from "../put/create-document-block.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import {
  DocumentBlockTestHelper,
  DOCUMENT_BLOCK_AREA_KEY,
  DOCUMENT_BLOCK_PROPERTY_ALIASES as ALIASES,
  DEFAULT_CULTURE,
  SECOND_CULTURE,
  type DocumentBlockInfrastructure
} from "./helpers/document-block-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateStructuredContent,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test Create Document Block";
const TEST_VARIANT_DOCUMENT_NAME = "_Test Create Document Block Variant";
const TEST_VARIANT_DOCUMENT_NAME_DA = "_Test Create Document Block Variant DA";
const EXISTING_KEY = "7d0e9c1a-1b2c-4d3e-8f4a-5b6c7d8e9f01";
const MISSING_KEY = "7d0e9c1a-1b2c-4d3e-8f4a-5b6c7d8e9f02";
const FIRST_TITLE = "First block";
const NEW_TITLE = "New block";
const EN_TITLE = "English title";
const DA_TITLE = "Dansk titel";
const CSS_CLASS = "highlight";

describe("create-document-block", () => {
  setupTestEnvironment();

  let infra: DocumentBlockInfrastructure;

  beforeEach(async () => {
    await DocumentBlockTestHelper.cleanup([TEST_DOCUMENT_NAME, TEST_VARIANT_DOCUMENT_NAME]);
    infra = await DocumentBlockTestHelper.createInfrastructure();
  });

  afterEach(async () => {
    await DocumentBlockTestHelper.cleanup([TEST_DOCUMENT_NAME, TEST_VARIANT_DOCUMENT_NAME]);
  });

  const call = (args: Record<string, unknown>) =>
    CreateDocumentBlockTool.handler(
      { culture: null, segment: null, ...args } as any,
      createMockRequestHandlerExtra()
    );

  const createDocument = async (values: Record<string, unknown> = {}) => {
    const builder = new DocumentBuilder().withName(TEST_DOCUMENT_NAME).withDocumentType(infra.docTypeId);
    for (const [alias, value] of Object.entries(values)) {
      builder.withValue(alias, value);
    }
    return (await builder.create()).getId();
  };

  const existingBlockList = () => ({
    layout: { "Umbraco.BlockList": [{ contentKey: EXISTING_KEY }] },
    contentData: [{ key: EXISTING_KEY, contentTypeKey: infra.elementTypeId, values: [{ alias: "title", value: FIRST_TITLE }] }],
    settingsData: [],
    expose: [{ contentKey: EXISTING_KEY, culture: null, segment: null }]
  });

  describe("BlockList", () => {
    it("should write contentData, expose, and layout into an empty property", async () => {
      // Arrange
      const documentId = await createDocument();

      // Act
      const result = await call({
        documentId,
        propertyAlias: ALIASES.blockList,
        contentTypeKey: infra.elementTypeId,
        properties: [{ alias: "title", value: NEW_TITLE }]
      });

      // Assert
      expect(createSnapshotResult(result, documentId)).toMatchSnapshot();
      const contentKey = validateStructuredContent(result, createDocumentBlockOutputSchema).results[0].contentKey;
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockList);
      expect(value.layout["Umbraco.BlockList"]).toHaveLength(1);
      expect(value.layout["Umbraco.BlockList"][0]).toMatchObject({ contentKey });
      expect(value.contentData).toHaveLength(1);
      expect(value.contentData[0].key).toBe(contentKey);
      expect(value.contentData[0].values.find((v: any) => v.alias === "title")?.value).toBe(NEW_TITLE);
      expect(value.expose).toEqual([{ contentKey, culture: null, segment: null }]);
    });

    it("should insert before an existing sibling with settings", async () => {
      // Arrange
      const documentId = await createDocument({ [ALIASES.blockList]: existingBlockList() });

      // Act
      const result = await call({
        documentId,
        propertyAlias: ALIASES.blockList,
        contentTypeKey: infra.elementTypeId,
        properties: [{ alias: "title", value: NEW_TITLE }],
        settings: { properties: [{ alias: "cssClass", value: CSS_CLASS }] },
        placement: { position: "before", contentKey: EXISTING_KEY }
      });

      // Assert
      expect(createSnapshotResult(result, documentId)).toMatchSnapshot();
      const contentKey = validateStructuredContent(result, createDocumentBlockOutputSchema).results[0].contentKey;
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockList);
      const layout = value.layout["Umbraco.BlockList"];
      expect(layout.map((l: any) => l.contentKey)).toEqual([contentKey, EXISTING_KEY]);
      expect(value.settingsData).toHaveLength(1);
      expect(value.settingsData[0].key).toBe(layout[0].settingsKey);
      expect(value.settingsData[0].contentTypeKey).toBe(infra.settingsTypeId);
      expect(value.expose.map((e: any) => e.contentKey)).toEqual(expect.arrayContaining([EXISTING_KEY, contentKey]));
    });

    it("should write nothing when the sibling does not exist", async () => {
      // Arrange
      const documentId = await createDocument({ [ALIASES.blockList]: existingBlockList() });

      // Act
      const result = await call({
        documentId,
        propertyAlias: ALIASES.blockList,
        contentTypeKey: infra.elementTypeId,
        properties: [{ alias: "title", value: NEW_TITLE }],
        placement: { position: "after", contentKey: MISSING_KEY }
      });

      // Assert - error, and none of contentData/expose/layout was written
      expect(result).toMatchSnapshot();
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockList);
      expect(value.contentData).toHaveLength(1);
      expect(value.expose).toHaveLength(1);
      expect(value.layout["Umbraco.BlockList"]).toHaveLength(1);
    });

    it("should reject grid options and element types the data type does not allow", async () => {
      // Arrange
      const documentId = await createDocument();

      // Act
      const gridResult = await call({
        documentId,
        propertyAlias: ALIASES.blockList,
        contentTypeKey: infra.elementTypeId,
        grid: { columnSpan: 6 }
      });
      const typeResult = await call({
        documentId,
        propertyAlias: ALIASES.blockList,
        contentTypeKey: infra.containerTypeId
      });

      // Assert
      expect(gridResult).toMatchSnapshot();
      expect(typeResult.isError).toBe(true);
      expect(JSON.stringify(typeResult.structuredContent)).toContain("Element type not allowed");
    });
  });

  describe("BlockGrid", () => {
    it("should insert into a named area of a block created by this tool", async () => {
      // Arrange - document with an empty grid; the parent container is created by the tool itself
      const documentId = await createDocument();
      const parentResult = await call({
        documentId,
        propertyAlias: ALIASES.blockGrid,
        contentTypeKey: infra.containerTypeId,
        properties: [{ alias: "heading", value: FIRST_TITLE }]
      });
      const parentKey = validateStructuredContent(parentResult, createDocumentBlockOutputSchema).results[0].contentKey;

      // Act
      const result = await call({
        documentId,
        propertyAlias: ALIASES.blockGrid,
        contentTypeKey: infra.elementTypeId,
        properties: [{ alias: "title", value: NEW_TITLE }],
        grid: { areaKey: DOCUMENT_BLOCK_AREA_KEY, parentContentKey: parentKey, columnSpan: 6 }
      });

      // Assert
      expect(createSnapshotResult(result, documentId)).toMatchSnapshot();
      const childKey = validateStructuredContent(result, createDocumentBlockOutputSchema).results[0].contentKey;
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockGrid);
      const root = value.layout["Umbraco.BlockGrid"];
      expect(root).toHaveLength(1);
      expect(root[0]).toMatchObject({ contentKey: parentKey, columnSpan: 12, rowSpan: 1 });
      const area = root[0].areas.find((a: any) => a.key === DOCUMENT_BLOCK_AREA_KEY);
      expect(area.items).toHaveLength(1);
      expect(area.items[0]).toMatchObject({ contentKey: childKey, columnSpan: 6, rowSpan: 1 });
      expect(value.contentData.map((b: any) => b.key)).toEqual([parentKey, childKey]);
      expect(value.expose.map((e: any) => e.contentKey)).toEqual([parentKey, childKey]);
    });

    it("should reject an element type the area does not allow", async () => {
      // Arrange
      const documentId = await createDocument();
      const parentResult = await call({
        documentId,
        propertyAlias: ALIASES.blockGrid,
        contentTypeKey: infra.containerTypeId
      });
      const parentKey = validateStructuredContent(parentResult, createDocumentBlockOutputSchema).results[0].contentKey;

      // Act - the container block type has allowInAreas: false
      const result = await call({
        documentId,
        propertyAlias: ALIASES.blockGrid,
        contentTypeKey: infra.containerTypeId,
        grid: { areaKey: DOCUMENT_BLOCK_AREA_KEY, parentContentKey: parentKey }
      });

      // Assert
      expect(result.isError).toBe(true);
      expect(JSON.stringify(result.structuredContent)).toContain("not allowed in areas");
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockGrid);
      expect(value.contentData).toHaveLength(1);
    });
  });

  describe("RichText", () => {
    it("should write the markup element alongside the layout entry", async () => {
      // Arrange
      const documentId = await createDocument();

      // Act
      const result = await call({
        documentId,
        propertyAlias: ALIASES.richText,
        contentTypeKey: infra.elementTypeId,
        properties: [{ alias: "title", value: NEW_TITLE }]
      });

      // Assert
      expect(createSnapshotResult(result, documentId)).toMatchSnapshot();
      const contentKey = validateStructuredContent(result, createDocumentBlockOutputSchema).results[0].contentKey;
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.richText);
      expect(value.markup).toContain(`data-content-key="${contentKey}"`);
      expect(value.blocks.layout["Umbraco.RichText"]).toHaveLength(1);
      expect(value.blocks.layout["Umbraco.RichText"][0]).toMatchObject({ contentKey });
      expect(value.blocks.contentData[0].key).toBe(contentKey);
      expect(value.blocks.expose).toEqual([{ contentKey, culture: null, segment: null }]);
    });
  });

  describe("culture variance", () => {
    it("should write one expose entry per culture for a culture-variant block", async () => {
      // Arrange
      const { variantElementTypeId, variantDocTypeId } = await DocumentBlockTestHelper.createVariantInfrastructure();
      const documentId = (await new DocumentBuilder()
        .withDocumentType(variantDocTypeId)
        .withVariant(TEST_VARIANT_DOCUMENT_NAME, DEFAULT_CULTURE)
        .withVariant(TEST_VARIANT_DOCUMENT_NAME_DA, SECOND_CULTURE)
        .create()).getId();

      // Act
      const result = await call({
        documentId,
        propertyAlias: ALIASES.variantBlockList,
        contentTypeKey: variantElementTypeId,
        properties: [
          { alias: "title", value: EN_TITLE, culture: DEFAULT_CULTURE },
          { alias: "title", value: DA_TITLE, culture: SECOND_CULTURE }
        ]
      });

      // Assert
      expect(createSnapshotResult(result, documentId)).toMatchSnapshot();
      const contentKey = validateStructuredContent(result, createDocumentBlockOutputSchema).results[0].contentKey;
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.variantBlockList);
      expect(value.expose).toEqual(expect.arrayContaining([
        { contentKey, culture: DEFAULT_CULTURE, segment: null },
        { contentKey, culture: SECOND_CULTURE, segment: null }
      ]));
      expect(value.expose).toHaveLength(2);
      const titles = value.contentData[0].values.filter((v: any) => v.alias === "title");
      expect(titles).toEqual(expect.arrayContaining([
        expect.objectContaining({ culture: DEFAULT_CULTURE, value: EN_TITLE }),
        expect.objectContaining({ culture: SECOND_CULTURE, value: DA_TITLE })
      ]));
    });
  });

  it("should handle a non-existent document", async () => {
    // Act
    const result = await call({
      documentId: BLANK_UUID,
      propertyAlias: ALIASES.blockList,
      contentTypeKey: infra.elementTypeId
    });

    // Assert
    expect(result).toMatchSnapshot();
  });
});
