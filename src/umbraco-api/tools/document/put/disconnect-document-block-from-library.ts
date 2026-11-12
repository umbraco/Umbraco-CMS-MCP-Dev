import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { CurrentUserResponseModel, ElementResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { getPropertyKey } from "./helpers/property-matching.js";
import {
  buildExposeEntries,
  findBlockTypeConfiguration,
  findLayoutLocation,
  rekeyRteBlockElement
} from "./helpers/block-builder.js";
import { loadDocumentBlockContext, saveDocumentValues } from "./helpers/document-block-context.js";
import { updateBlockPropertyOutputSchema } from "./update-block-property.js";
import {
  type ToolDefinition,
  createToolResult,
  ToolValidationError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const disconnectDocumentBlockFromLibraryOutputSchema = updateBlockPropertyOutputSchema;

const disconnectDocumentBlockFromLibrarySchema = {
  documentId: z.string().uuid().describe("The document that holds the block"),
  propertyAlias: z.string().min(1).describe("Document property alias of the BlockList, BlockGrid, or RichText property"),
  culture: z.string().nullish().describe("Culture, only for culture-variant document properties"),
  segment: z.string().nullish().describe("Segment, only for segment-variant document properties"),
  contentKey: z.string().uuid().describe("The Library Element id the block references, or the block's layout key (needed when the same Element is used more than once in the property)"),
};

type DisconnectDocumentBlockFromLibraryModel = {
  documentId: string;
  propertyAlias: string;
  culture?: string | null;
  segment?: string | null;
  contentKey: string;
};

const PUBLISHED_STATES = new Set(["Published", "PublishedPendingChanges"]);

const DisconnectDocumentBlockFromLibraryTool = {
  name: "disconnect-document-block-from-library",
  description: `Disconnects a block from the Library Element it references (Umbraco 19 reusable content), mirroring
  the backoffice's "Disconnect from Library" action, in a document's BlockList, BlockGrid, or RichText property.

  - Copies the Element's current content into a new local block (new contentKey) and points the block's layout
    entry at it, so later changes to the Element no longer affect this document (and vice versa).
  - The local copy is exposed in the cultures the Element is published in (otherwise invariant, or the
    document's cultures for a culture-variant element type).
  - The block keeps its position, settings, and (BlockGrid) areas. The Element stays in the Library.
  - The document is saved, not published.

  Example: { documentId: "...", propertyAlias: "mainContent", contentKey: "<element id or layout key>" }`,
  inputSchema: disconnectDocumentBlockFromLibrarySchema,
  outputSchema: disconnectDocumentBlockFromLibraryOutputSchema.shape,
  annotations: {
    idempotentHint: false,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: (async (model: DisconnectDocumentBlockFromLibraryModel) => {
    const client = UmbracoManagementClient.getClient();
    const ctx = await loadDocumentBlockContext(model);
    const { kind, container, blockConfigs } = ctx;
    const propertyKey = getPropertyKey(model.propertyAlias, model.culture, model.segment);

    const location = findLayoutLocation(container.layoutItems, model.contentKey);
    if (!location) {
      throw new ToolValidationError({
        title: "Block not found",
        detail: `No block with contentKey or layout key '${model.contentKey}' exists in property '${propertyKey}'`
      });
    }
    if (location.entry.isExternalContent !== true) {
      throw new ToolValidationError({
        title: "Block is not a Library block",
        detail: `Block '${model.contentKey}' already holds local content; only blocks that reference a Library Element can be disconnected`
      });
    }
    const elementId = location.entry.contentKey;

    let element: ElementResponseModel;
    try {
      element = await client.getElementById(elementId);
    } catch {
      throw new ToolValidationError({
        title: "Library Element not found",
        detail: `The block references Element '${elementId}', which no longer exists, so there is no content to copy`
      });
    }
    const contentTypeKey = element.documentType.id;

    const newKey = uuidv4();
    // RichText markup is computed first so a mismatch fails before anything is mutated.
    let newMarkup: string | null = null;
    if (kind === "RichText") {
      newMarkup = rekeyRteBlockElement(ctx.propertyValue.markup ?? "", elementId, newKey);
      if (newMarkup === null) {
        throw new ToolValidationError({
          title: "Block markup not found",
          detail: `Block '${elementId}' has a layout entry but no <umb-rte-block> element in the markup`
        });
      }
    }

    // --- Expose the local copy where the Element was visible
    const elementType = await client.getDocumentTypeById(contentTypeKey);
    let exposeCultures: Array<string | null> = [null];
    if (elementType.variesByCulture) {
      const published = element.variants
        .filter(v => PUBLISHED_STATES.has(String(v.state)))
        .map(v => v.culture)
        .filter((c): c is string => !!c);
      const documentCultures = ctx.document.variants.map(v => v.culture).filter((c): c is string => !!c);
      exposeCultures = published.length > 0
        ? published
        : model.culture ? [model.culture] : documentCultures.length > 0 ? documentCultures : [null];
    }

    // --- Swap the reference for a local block
    container.contentData.push({
      key: newKey,
      contentTypeKey,
      values: element.values.map(v => ({
        alias: v.alias,
        culture: v.culture ?? null,
        segment: v.segment ?? null,
        value: v.value
      }))
    });
    container.expose.push(...buildExposeEntries(newKey, exposeCultures));
    location.entry.contentKey = newKey;
    delete location.entry.isExternalContent;
    if (!location.entry.key) {
      location.entry.key = uuidv4();
    }
    if (newMarkup !== null) {
      ctx.propertyValue.markup = newMarkup;
    }

    await saveDocumentValues(model.documentId, ctx.document);

    const notConfigured = !findBlockTypeConfiguration(blockConfigs, contentTypeKey);
    return createToolResult({
      success: true,
      message: `Disconnected 1 block in ${kind} property '${propertyKey}' from the Library`,
      results: [{
        success: true,
        contentKey: newKey,
        layoutKey: location.entry.key,
        message: "Copied the Library Element's content into a local block; the Element itself is unchanged",
        ...(notConfigured
          ? { warnings: [`Element type '${contentTypeKey}' is not configured as a block on property '${model.propertyAlias}'`] }
          : {})
      }]
    });
  }),
} satisfies ToolDefinition<typeof disconnectDocumentBlockFromLibrarySchema, typeof disconnectDocumentBlockFromLibraryOutputSchema.shape>;

export default withStandardDecorators(DisconnectDocumentBlockFromLibraryTool);
