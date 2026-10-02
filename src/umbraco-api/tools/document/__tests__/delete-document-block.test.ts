import DeleteDocumentBlockTool, { deleteDocumentBlockOutputSchema } from "../put/delete-document-block.js";
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

const TEST_DOCUMENT_NAME = "_Test Delete Document Block";
const TEST_VARIANT_DOCUMENT_NAME = "_Test Delete Document Block Variant";
const TEST_VARIANT_DOCUMENT_NAME_DA = "_Test Delete Document Block Variant DA";
const KEY_A = "3f9b2c1d-4e5f-4a6b-8c7d-9e0f1a2b3c01";
const KEY_B = "3f9b2c1d-4e5f-4a6b-8c7d-9e0f1a2b3c02";
const SETTINGS_KEY = "3f9b2c1d-4e5f-4a6b-8c7d-9e0f1a2b3c03";
const MISSING_KEY = "3f9b2c1d-4e5f-4a6b-8c7d-9e0f1a2b3c04";
const INTRO_MARKUP = "<p>Intro</p>";

describe("delete-document-block", () => {
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
    DeleteDocumentBlockTool.handler(
      { culture: null, segment: null, ...args } as any,
      createMockRequestHandlerExtra()
    );

  const createDocument = async (alias: string, value: unknown) =>
    (await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(infra.docTypeId)
      .withValue(alias, value)
      .create()).getId();

  const block = (key: string, contentTypeKey: string) => ({ key, contentTypeKey, values: [] });
  const expose = (key: string) => ({ contentKey: key, culture: null, segment: null });

  it("should remove a BlockList block with its settings, expose, and layout entries", async () => {
    // Arrange
    const documentId = await createDocument(ALIASES.blockList, {
      layout: { "Umbraco.BlockList": [{ contentKey: KEY_A, settingsKey: SETTINGS_KEY }, { contentKey: KEY_B }] },
      contentData: [block(KEY_A, infra.elementTypeId), block(KEY_B, infra.elementTypeId)],
      settingsData: [block(SETTINGS_KEY, infra.settingsTypeId)],
      expose: [expose(KEY_A), expose(KEY_B)]
    });

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey: KEY_A });

    // Assert
    expect(createSnapshotResult(result, documentId)).toMatchSnapshot();
    validateStructuredContent(result, deleteDocumentBlockOutputSchema);
    const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockList);
    expect(value.layout["Umbraco.BlockList"].map((l: any) => l.contentKey)).toEqual([KEY_B]);
    expect(value.contentData.map((b: any) => b.key)).toEqual([KEY_B]);
    expect(value.settingsData).toEqual([]);
    expect(value.expose.map((e: any) => e.contentKey)).toEqual([KEY_B]);
  });

  describe("BlockGrid", () => {
    const gridWithChild = () => ({
      layout: {
        "Umbraco.BlockGrid": [{
          contentKey: KEY_A,
          columnSpan: 12,
          rowSpan: 1,
          areas: [{ key: DOCUMENT_BLOCK_AREA_KEY, items: [{ contentKey: KEY_B, columnSpan: 12, rowSpan: 1, areas: [] }] }]
        }]
      },
      contentData: [block(KEY_A, infra.containerTypeId), block(KEY_B, infra.elementTypeId)],
      settingsData: [],
      expose: [expose(KEY_A), expose(KEY_B)]
    });

    it("should refuse to delete a block whose areas still contain blocks", async () => {
      // Arrange
      const documentId = await createDocument(ALIASES.blockGrid, gridWithChild());

      // Act
      const result = await call({ documentId, propertyAlias: ALIASES.blockGrid, contentKey: KEY_A });

      // Assert - rejected, naming the nested block, and nothing removed
      expect(result).toMatchSnapshot();
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockGrid);
      expect(value.contentData).toHaveLength(2);
      expect(value.expose).toHaveLength(2);
    });

    it("should delete a block from a named area", async () => {
      // Arrange
      const documentId = await createDocument(ALIASES.blockGrid, gridWithChild());

      // Act
      const result = await call({ documentId, propertyAlias: ALIASES.blockGrid, contentKey: KEY_B });

      // Assert
      expect(createSnapshotResult(result, documentId)).toMatchSnapshot();
      validateStructuredContent(result, deleteDocumentBlockOutputSchema);
      const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockGrid);
      const root = value.layout["Umbraco.BlockGrid"];
      expect(root.map((l: any) => l.contentKey)).toEqual([KEY_A]);
      expect(root[0].areas.find((a: any) => a.key === DOCUMENT_BLOCK_AREA_KEY).items).toEqual([]);
      expect(value.contentData.map((b: any) => b.key)).toEqual([KEY_A]);
      expect(value.expose.map((e: any) => e.contentKey)).toEqual([KEY_A]);
    });
  });

  it("should remove a RichText block's markup element and layout entry", async () => {
    // Arrange
    const documentId = await createDocument(ALIASES.richText, {
      markup: `${INTRO_MARKUP}<umb-rte-block data-content-key="${KEY_A}"><!--Umbraco-Block--></umb-rte-block>`,
      blocks: {
        layout: { "Umbraco.RichText": [{ contentKey: KEY_A }] },
        contentData: [block(KEY_A, infra.elementTypeId)],
        settingsData: [],
        expose: [expose(KEY_A)]
      }
    });

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.richText, contentKey: KEY_A });

    // Assert
    expect(createSnapshotResult(result, documentId)).toMatchSnapshot();
    validateStructuredContent(result, deleteDocumentBlockOutputSchema);
    const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.richText);
    expect(value.markup).not.toContain(KEY_A);
    expect(value.markup).toContain("Intro");
    expect(value.blocks.layout["Umbraco.RichText"] ?? []).toEqual([]);
    expect(value.blocks.contentData).toEqual([]);
    expect(value.blocks.expose).toEqual([]);
  });

  it("should remove every culture's expose entry of a culture-variant block", async () => {
    // Arrange - a two-culture block created by create-document-block
    const { variantElementTypeId, variantDocTypeId } = await DocumentBlockTestHelper.createVariantInfrastructure();
    const documentId = (await new DocumentBuilder()
      .withDocumentType(variantDocTypeId)
      .withVariant(TEST_VARIANT_DOCUMENT_NAME, DEFAULT_CULTURE)
      .withVariant(TEST_VARIANT_DOCUMENT_NAME_DA, SECOND_CULTURE)
      .create()).getId();
    const createTwoCultureBlock = async () => {
      const created = await CreateDocumentBlockTool.handler(
        {
          documentId,
          propertyAlias: ALIASES.variantBlockList,
          culture: null,
          segment: null,
          contentTypeKey: variantElementTypeId,
          properties: [
            { alias: "title", value: "English title", culture: DEFAULT_CULTURE },
            { alias: "title", value: "Dansk titel", culture: SECOND_CULTURE }
          ]
        } as any,
        createMockRequestHandlerExtra()
      );
      return validateStructuredContent(created, createDocumentBlockOutputSchema).results[0].contentKey;
    };
    const contentKey = await createTwoCultureBlock();
    // A second block keeps the property value from being emptied, so the remaining expose array is observable.
    const keptKey = await createTwoCultureBlock();
    const before = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.variantBlockList);
    expect(before.expose.filter((e: any) => e.contentKey === contentKey).map((e: any) => e.culture).sort())
      .toEqual([DEFAULT_CULTURE, SECOND_CULTURE].sort());

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.variantBlockList, contentKey });

    // Assert - both cultures' expose entries for the deleted block are gone; the other block's remain
    validateStructuredContent(result, deleteDocumentBlockOutputSchema);
    const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.variantBlockList);
    expect(value.expose.filter((e: any) => e.contentKey === contentKey)).toEqual([]);
    expect(value.expose).toEqual(expect.arrayContaining([
      { contentKey: keptKey, culture: DEFAULT_CULTURE, segment: null },
      { contentKey: keptKey, culture: SECOND_CULTURE, segment: null }
    ]));
    expect(value.expose).toHaveLength(2);
    expect(value.contentData.map((b: any) => b.key)).toEqual([keptKey]);
    expect(value.layout["Umbraco.BlockList"].map((l: any) => l.contentKey)).toEqual([keptKey]);
  });

  it("should return an error when the block does not exist", async () => {
    // Arrange
    const documentId = await createDocument(ALIASES.blockList, {
      layout: { "Umbraco.BlockList": [{ contentKey: KEY_A }] },
      contentData: [block(KEY_A, infra.elementTypeId)],
      settingsData: [],
      expose: [expose(KEY_A)]
    });

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey: MISSING_KEY });

    // Assert
    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.structuredContent)).toContain(`No block with contentKey '${MISSING_KEY}'`);
  });

  it("should handle a non-existent document", async () => {
    // Act
    const result = await call({ documentId: BLANK_UUID, propertyAlias: ALIASES.blockList, contentKey: KEY_A });

    // Assert
    expect(result).toMatchSnapshot();
  });
});
