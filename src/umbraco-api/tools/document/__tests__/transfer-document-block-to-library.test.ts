import TransferDocumentBlockToLibraryTool, { transferDocumentBlockToLibraryOutputSchema } from "../put/transfer-document-block-to-library.js";
import CreateDocumentBlockTool, { createDocumentBlockOutputSchema } from "../put/create-document-block.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import {
  DocumentBlockTestHelper,
  createBlockSnapshotResult,
  DOCUMENT_BLOCK_PROPERTY_ALIASES as ALIASES,
  type DocumentBlockInfrastructure
} from "./helpers/document-block-test-helper.js";
import { ElementTestHelper } from "../../element/__tests__/helpers/element-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateStructuredContent,
  validateErrorResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test Transfer Block To Library";
const TEST_ELEMENT_NAME = "_Test Transferred Library Element";
const BLOCK_TITLE = "Transferred title";
const CSS_CLASS = "highlight";

describe("transfer-document-block-to-library", () => {
  setupTestEnvironment();

  let infra: DocumentBlockInfrastructure;

  beforeEach(async () => {
    await DocumentBlockTestHelper.cleanup([TEST_DOCUMENT_NAME]);
    infra = await DocumentBlockTestHelper.createInfrastructure();
  });

  afterEach(async () => {
    // Elements must go before the element types the block infrastructure cleanup deletes.
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await DocumentBlockTestHelper.cleanup([TEST_DOCUMENT_NAME]);
  });

  const call = (args: Record<string, unknown>) =>
    TransferDocumentBlockToLibraryTool.handler(
      { culture: null, segment: null, ...args } as any,
      createMockRequestHandlerExtra()
    );

  const createDocumentWithBlock = async (propertyAlias: string, extra: Record<string, unknown> = {}) => {
    const documentId = (await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(infra.docTypeId)
      .create()).getId();
    const created = await CreateDocumentBlockTool.handler(
      {
        culture: null,
        segment: null,
        documentId,
        propertyAlias,
        contentTypeKey: infra.elementTypeId,
        properties: [{ alias: "title", value: BLOCK_TITLE }],
        ...extra
      } as any,
      createMockRequestHandlerExtra()
    );
    const contentKey = validateStructuredContent(created, createDocumentBlockOutputSchema).results[0].contentKey;
    return { documentId, contentKey };
  };

  it("should move a BlockList block's content into a published Library Element and reference it", async () => {
    // Arrange
    const { documentId, contentKey } = await createDocumentWithBlock(ALIASES.blockList, {
      settings: { properties: [{ alias: "cssClass", value: CSS_CLASS }] }
    });
    const before = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockList);
    const settingsKey = before.layout["Umbraco.BlockList"][0].settingsKey;

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey, name: TEST_ELEMENT_NAME });

    // Assert
    expect(createBlockSnapshotResult(result, documentId)).toMatchSnapshot();
    const elementId = validateStructuredContent(result, transferDocumentBlockToLibraryOutputSchema).results[0].contentKey;
    const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockList);
    expect(value.layout["Umbraco.BlockList"]).toEqual([
      expect.objectContaining({ contentKey: elementId, isExternalContent: true, settingsKey })
    ]);
    expect(value.contentData).toEqual([]);
    expect(value.expose).toEqual([]);
    expect(value.settingsData.map((s: any) => s.key)).toEqual([settingsKey]);

    const element = await UmbracoManagementClient.getClient().getElementById(elementId);
    expect(element.documentType.id).toBe(infra.elementTypeId);
    expect(element.variants[0]).toMatchObject({ name: TEST_ELEMENT_NAME, state: "Published" });
    expect(element.values.find(v => v.alias === "title")?.value).toBe(BLOCK_TITLE);
  });

  it("should leave the Element as a draft when publish is false", async () => {
    // Arrange
    const { documentId, contentKey } = await createDocumentWithBlock(ALIASES.blockList);

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey, name: TEST_ELEMENT_NAME, publish: false });

    // Assert
    const elementId = validateStructuredContent(result, transferDocumentBlockToLibraryOutputSchema).results[0].contentKey;
    const element = await UmbracoManagementClient.getClient().getElementById(elementId);
    expect(element.variants[0].state).toBe("Draft");
  });

  it("should re-key the RichText markup element to the Library Element", async () => {
    // Arrange
    const { documentId, contentKey } = await createDocumentWithBlock(ALIASES.richText);

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.richText, contentKey, name: TEST_ELEMENT_NAME });

    // Assert
    const elementId = validateStructuredContent(result, transferDocumentBlockToLibraryOutputSchema).results[0].contentKey;
    const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.richText);
    expect(value.markup).toContain(`data-content-key="${elementId}"`);
    expect(value.markup).not.toContain(contentKey);
    expect(value.blocks.layout["Umbraco.RichText"]).toEqual([
      expect.objectContaining({ contentKey: elementId, isExternalContent: true })
    ]);
    expect(value.blocks.contentData).toEqual([]);
  });

  it("should refuse a block that is already a Library block", async () => {
    // Arrange
    const { documentId, contentKey } = await createDocumentWithBlock(ALIASES.blockList);
    const first = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey, name: TEST_ELEMENT_NAME });
    const elementId = validateStructuredContent(first, transferDocumentBlockToLibraryOutputSchema).results[0].contentKey;

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey: elementId, name: TEST_ELEMENT_NAME });

    // Assert
    expect(result.isError).toBe(true);
    expect(JSON.stringify(validateErrorResult(result))).toContain("Block is already in the Library");
  });

  it("should handle a non-existent block", async () => {
    // Arrange
    const { documentId } = await createDocumentWithBlock(ALIASES.blockList);

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey: BLANK_UUID, name: TEST_ELEMENT_NAME });

    // Assert
    expect(result.isError).toBe(true);
    expect(JSON.stringify(validateErrorResult(result))).toContain("Block not found");
    expect(await ElementTestHelper.findElement(TEST_ELEMENT_NAME)).toBeUndefined();
  });
});
