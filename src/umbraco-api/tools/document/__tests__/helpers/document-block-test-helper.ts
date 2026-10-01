import { UmbracoManagementClient } from "@umb-management-client";
import { TextString_DATA_TYPE_ID } from "@umbraco-cms/mcp-server-sdk";
import { DocumentTestHelper } from "./document-test-helper.js";
import { DocumentTypeBuilder } from "../../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../../data-type/__tests__/helpers/data-type-test-helper.js";
import { LanguageBuilder } from "../../../language/__tests__/helpers/language-builder.js";

/**
 * Names of every entity the block infrastructure creates, so cleanup can find them by name
 * (including leftovers from a previously failed run).
 */
export const DOCUMENT_BLOCK_NAMES = {
  element: "_Test DocBlock Element",
  settings: "_Test DocBlock Settings",
  container: "_Test DocBlock Container",
  variantElement: "_Test DocBlock Variant Element",
  blockListDataType: "_Test DocBlock BlockList",
  blockGridDataType: "_Test DocBlock BlockGrid",
  rteDataType: "_Test DocBlock RichText",
  variantBlockListDataType: "_Test DocBlock Variant BlockList",
  docType: "_Test DocBlock DocType",
  variantDocType: "_Test DocBlock Variant DocType",
} as const;

/** Key of the named area configured on the container block type in the BlockGrid data type. */
export const DOCUMENT_BLOCK_AREA_KEY = "6a1f4b2e-3c5d-4e7f-8a9b-0c1d2e3f4a5b";

export const DOCUMENT_BLOCK_PROPERTY_ALIASES = {
  blockList: "blockList",
  blockGrid: "blockGrid",
  richText: "richText",
  variantBlockList: "variantBlocks",
} as const;

export const SECOND_CULTURE = "da-DK";
export const DEFAULT_CULTURE = "en-US";

export interface DocumentBlockInfrastructure {
  elementTypeId: string;
  settingsTypeId: string;
  containerTypeId: string;
  docTypeId: string;
}

export interface VariantDocumentBlockInfrastructure {
  variantElementTypeId: string;
  variantDocTypeId: string;
}

async function createElementType(name: string, propertyAlias: string, variesByCulture = false): Promise<string> {
  const builder = await new DocumentTypeBuilder()
    .withName(name)
    .asElement(true)
    .variesByCulture(variesByCulture)
    .withProperty(propertyAlias, propertyAlias, TextString_DATA_TYPE_ID, { variesByCulture })
    .create();
  return builder.getId();
}

/**
 * Builds the infrastructure used by the create/delete-document-block integration tests:
 * element types, BlockList/BlockGrid/RichText data types, and a document type with one
 * property of each.
 */
export class DocumentBlockTestHelper {
  private static createdLanguage: LanguageBuilder | null = null;

  static async createInfrastructure(): Promise<DocumentBlockInfrastructure> {
    const elementTypeId = await createElementType(DOCUMENT_BLOCK_NAMES.element, "title");
    const settingsTypeId = await createElementType(DOCUMENT_BLOCK_NAMES.settings, "cssClass");
    const containerTypeId = await createElementType(DOCUMENT_BLOCK_NAMES.container, "heading");

    const blockList = await new DataTypeBuilder()
      .withName(DOCUMENT_BLOCK_NAMES.blockListDataType)
      .withEditorAlias("Umbraco.BlockList")
      .withEditorUiAlias("Umb.PropertyEditorUi.BlockList")
      .withValue("blocks", [
        { contentElementTypeKey: elementTypeId, settingsElementTypeKey: settingsTypeId, label: "Element" }
      ])
      .create();

    const blockGrid = await new DataTypeBuilder()
      .withName(DOCUMENT_BLOCK_NAMES.blockGridDataType)
      .withEditorAlias("Umbraco.BlockGrid")
      .withEditorUiAlias("Umb.PropertyEditorUi.BlockGrid")
      .withValue("gridColumns", 12)
      .withValue("blocks", [
        {
          contentElementTypeKey: elementTypeId,
          label: "Element",
          columnSpanOptions: [],
          rowMinSpan: 1,
          rowMaxSpan: 1,
          allowAtRoot: true,
          allowInAreas: true
        },
        {
          contentElementTypeKey: containerTypeId,
          label: "Container",
          columnSpanOptions: [],
          rowMinSpan: 1,
          rowMaxSpan: 1,
          allowAtRoot: true,
          allowInAreas: false,
          areaGridColumns: 12,
          areas: [
            {
              key: DOCUMENT_BLOCK_AREA_KEY,
              alias: "main",
              columnSpan: 12,
              rowSpan: 1,
              minAllowed: 0,
              maxAllowed: null,
              specifiedAllowance: []
            }
          ]
        }
      ])
      .create();

    const richText = await new DataTypeBuilder()
      .withName(DOCUMENT_BLOCK_NAMES.rteDataType)
      .withEditorAlias("Umbraco.RichText")
      .withEditorUiAlias("Umb.PropertyEditorUi.Tiptap")
      .withValue("blocks", [{ contentElementTypeKey: elementTypeId, label: "Element" }])
      .create();

    const docType = await new DocumentTypeBuilder()
      .withName(DOCUMENT_BLOCK_NAMES.docType)
      .allowAsRoot(true)
      .withProperty(DOCUMENT_BLOCK_PROPERTY_ALIASES.blockList, "Block List", blockList.getId(), { container: "Block List" })
      .withProperty(DOCUMENT_BLOCK_PROPERTY_ALIASES.blockGrid, "Block Grid", blockGrid.getId(), { container: "Block Grid" })
      .withProperty(DOCUMENT_BLOCK_PROPERTY_ALIASES.richText, "Rich Text", richText.getId(), { container: "Rich Text" })
      .create();

    return { elementTypeId, settingsTypeId, containerTypeId, docTypeId: docType.getId() };
  }

  /**
   * Builds a culture-variant document type with an invariant BlockList property whose element
   * type varies by culture (block-level variance). Ensures the second culture exists.
   */
  static async createVariantInfrastructure(): Promise<VariantDocumentBlockInfrastructure> {
    const client = UmbracoManagementClient.getClient();
    const languages = await client.getLanguage({});
    if (!languages.items.some(l => l.isoCode === SECOND_CULTURE)) {
      this.createdLanguage = await new LanguageBuilder()
        .withName("Danish (Denmark)")
        .withIsoCode(SECOND_CULTURE)
        .withIsDefault(false)
        .withIsMandatory(false)
        .withFallbackIsoCode(null)
        .create();
    }

    const variantElementTypeId = await createElementType(DOCUMENT_BLOCK_NAMES.variantElement, "title", true);

    const blockList = await new DataTypeBuilder()
      .withName(DOCUMENT_BLOCK_NAMES.variantBlockListDataType)
      .withEditorAlias("Umbraco.BlockList")
      .withEditorUiAlias("Umb.PropertyEditorUi.BlockList")
      .withValue("blocks", [{ contentElementTypeKey: variantElementTypeId, label: "Variant Element" }])
      .create();

    const docType = await new DocumentTypeBuilder()
      .withName(DOCUMENT_BLOCK_NAMES.variantDocType)
      .allowAsRoot(true)
      .variesByCulture(true)
      .withProperty(DOCUMENT_BLOCK_PROPERTY_ALIASES.variantBlockList, "Variant Blocks", blockList.getId())
      .create();

    return { variantElementTypeId, variantDocTypeId: docType.getId() };
  }

  /**
   * Reads a property value straight from the document (bypassing the tools under test).
   */
  static async getPropertyValue(documentId: string, alias: string, culture: string | null = null): Promise<any> {
    const client = UmbracoManagementClient.getClient();
    const document = await client.getDocumentById(documentId);
    return document.values.find(v => v.alias === alias && (v.culture ?? null) === culture)?.value;
  }

  /**
   * Deletes the given documents and all block infrastructure, in dependency order.
   */
  static async cleanup(documentNames: string[]): Promise<void> {
    for (const name of documentNames) {
      await DocumentTestHelper.cleanup(name);
    }
    await DocumentTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.docType);
    await DocumentTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.variantDocType);
    await DataTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.blockListDataType);
    await DataTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.blockGridDataType);
    await DataTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.rteDataType);
    await DataTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.variantBlockListDataType);
    await DocumentTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.element);
    await DocumentTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.settings);
    await DocumentTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.container);
    await DocumentTypeTestHelper.cleanup(DOCUMENT_BLOCK_NAMES.variantElement);
    if (this.createdLanguage) {
      await this.createdLanguage.cleanup();
      this.createdLanguage = null;
    }
  }
}
