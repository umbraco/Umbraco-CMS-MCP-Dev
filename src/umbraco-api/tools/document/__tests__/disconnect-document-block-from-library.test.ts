import DisconnectDocumentBlockFromLibraryTool, { disconnectDocumentBlockFromLibraryOutputSchema } from "../put/disconnect-document-block-from-library.js";
import CreateDocumentBlockTool from "../put/create-document-block.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import {
  DocumentBlockTestHelper,
  createBlockSnapshotResult,
  DOCUMENT_BLOCK_PROPERTY_ALIASES as ALIASES,
  type DocumentBlockInfrastructure
} from "./helpers/document-block-test-helper.js";
import { ElementBuilder } from "../../element/__tests__/helpers/element-builder.js";
import { ElementTestHelper } from "../../element/__tests__/helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateStructuredContent,
  validateErrorResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test Disconnect Block From Library";
const TEST_ELEMENT_NAME = "_Test Disconnect Library Element";
const ELEMENT_TITLE = "Library title";

describe("disconnect-document-block-from-library", () => {
  setupTestEnvironment();

  let infra: DocumentBlockInfrastructure;

  beforeEach(async () => {
    await DocumentBlockTestHelper.cleanup([TEST_DOCUMENT_NAME]);
    infra = await DocumentBlockTestHelper.createInfrastructure();
  });

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await DocumentBlockTestHelper.cleanup([TEST_DOCUMENT_NAME]);
  });

  const call = (args: Record<string, unknown>) =>
    DisconnectDocumentBlockFromLibraryTool.handler(
      { culture: null, segment: null, ...args } as any,
      createMockRequestHandlerExtra()
    );

  const createDocumentWithLibraryBlock = async (propertyAlias: string) => {
    const elementId = (await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .withDocumentType(infra.elementTypeId)
      .withValue("title", ELEMENT_TITLE)
      .create()).getId();
    const documentId = (await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(infra.docTypeId)
      .create()).getId();
    const inserted = await CreateDocumentBlockTool.handler(
      { culture: null, segment: null, documentId, propertyAlias, libraryElementId: elementId } as any,
      createMockRequestHandlerExtra()
    );
    expect(inserted.isError).toBeFalsy();
    return { documentId, elementId };
  };

  it("should copy the Element's content into a local block", async () => {
    // Arrange
    const { documentId, elementId } = await createDocumentWithLibraryBlock(ALIASES.blockList);

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey: elementId });

    // Assert
    expect(createBlockSnapshotResult(result, documentId)).toMatchSnapshot();
    const newKey = validateStructuredContent(result, disconnectDocumentBlockFromLibraryOutputSchema).results[0].contentKey;
    expect(newKey).not.toBe(elementId);
    const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.blockList);
    const layout = value.layout["Umbraco.BlockList"];
    expect(layout).toHaveLength(1);
    expect(layout[0].contentKey).toBe(newKey);
    expect(layout[0].isExternalContent ?? false).toBe(false);
    expect(value.contentData).toHaveLength(1);
    expect(value.contentData[0]).toMatchObject({ key: newKey, contentTypeKey: infra.elementTypeId });
    expect(value.contentData[0].values.find((v: any) => v.alias === "title")?.value).toBe(ELEMENT_TITLE);
    expect(value.expose).toEqual([{ contentKey: newKey, culture: null }]);
    // The Element stays in the Library
    expect(await ElementTestHelper.findElement(TEST_ELEMENT_NAME)).toBeDefined();
  });

  it("should re-key the RichText markup element to the new local block", async () => {
    // Arrange
    const { documentId, elementId } = await createDocumentWithLibraryBlock(ALIASES.richText);

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.richText, contentKey: elementId });

    // Assert
    const newKey = validateStructuredContent(result, disconnectDocumentBlockFromLibraryOutputSchema).results[0].contentKey;
    const value = await DocumentBlockTestHelper.getPropertyValue(documentId, ALIASES.richText);
    expect(value.markup).toContain(`data-content-key="${newKey}"`);
    expect(value.markup).not.toContain(elementId);
    expect(value.blocks.contentData.map((b: any) => b.key)).toEqual([newKey]);
  });

  it("should refuse a block that holds local content", async () => {
    // Arrange
    const documentId = (await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(infra.docTypeId)
      .create()).getId();
    const created = await CreateDocumentBlockTool.handler(
      { culture: null, segment: null, documentId, propertyAlias: ALIASES.blockList, contentTypeKey: infra.elementTypeId } as any,
      createMockRequestHandlerExtra()
    );
    const contentKey = (created.structuredContent as any).results[0].contentKey;

    // Act
    const result = await call({ documentId, propertyAlias: ALIASES.blockList, contentKey });

    // Assert
    expect(result.isError).toBe(true);
    expect(JSON.stringify(validateErrorResult(result))).toContain("Block is not a Library block");
  });
});
