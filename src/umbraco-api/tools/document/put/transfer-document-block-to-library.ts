import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { getPropertyKey } from "./helpers/property-matching.js";
import { findLayoutLocation, rekeyRteBlockElement } from "./helpers/block-builder.js";
import { loadDocumentBlockContext, saveDocumentValues } from "./helpers/document-block-context.js";
import { updateBlockPropertyOutputSchema } from "./update-block-property.js";
import {
  type ToolDefinition,
  createToolResult,
  ToolValidationError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const transferDocumentBlockToLibraryOutputSchema = updateBlockPropertyOutputSchema;

const transferDocumentBlockToLibrarySchema = {
  documentId: z.string().uuid().describe("The document that holds the block"),
  propertyAlias: z.string().min(1).describe("Document property alias of the BlockList, BlockGrid, or RichText property"),
  culture: z.string().nullish().describe("Culture, only for culture-variant document properties"),
  segment: z.string().nullish().describe("Segment, only for segment-variant document properties"),
  contentKey: z.string().uuid().describe("contentKey (or layout key) of the local block to transfer"),
  name: z.string().min(1).describe("Name of the new Library Element"),
  parentId: z.string().uuid().nullish().describe("Library folder to create the Element in (default: Library root)"),
  publish: z.boolean().optional().describe("Publish the new Element in the cultures the block is exposed in (default true, as the backoffice does). When false, the Element stays a draft and the block will not render until it is published"),
};

type TransferDocumentBlockToLibraryModel = {
  documentId: string;
  propertyAlias: string;
  culture?: string | null;
  segment?: string | null;
  contentKey: string;
  name: string;
  parentId?: string | null;
  publish?: boolean;
};

const unique = <T,>(values: T[]) => [...new Set(values)];

const isEmptyValue = (value: unknown) =>
  value === null || value === undefined || value === "" || value === false || (Array.isArray(value) && value.length === 0);

const TransferDocumentBlockToLibraryTool = {
  name: "transfer-document-block-to-library",
  description: `Transfers a local block in a document's BlockList, BlockGrid, or RichText property to the Library
  (Umbraco 19 reusable content), mirroring the backoffice's "Transfer to Library" action.

  - Creates a new Element from the block's content (all cultures the block holds data in), named 'name',
    in the Library root or the folder given by parentId.
  - By default publishes the Element in the cultures the block is exposed in (publish: false keeps it a draft).
  - Replaces the block with a reference to the Element: its contentData and expose entries are removed and
    the layout entry points at the Element (isExternalContent). The block keeps its position, settings,
    and (BlockGrid) areas.
  - Afterwards the content is edited with the element tools and can be reused in other documents with
    create-document-block's libraryElementId. Use disconnect-document-block-from-library to undo.
  - The document is saved, not published.

  Example: { documentId: "...", propertyAlias: "mainContent", contentKey: "...", name: "Shared promo" }`,
  inputSchema: transferDocumentBlockToLibrarySchema,
  outputSchema: transferDocumentBlockToLibraryOutputSchema.shape,
  annotations: {
    idempotentHint: false,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: (async (model: TransferDocumentBlockToLibraryModel) => {
    const client = UmbracoManagementClient.getClient();
    const ctx = await loadDocumentBlockContext(model);
    const { kind, container } = ctx;
    const propertyKey = getPropertyKey(model.propertyAlias, model.culture, model.segment);

    // --- Find the local block
    const location = findLayoutLocation(container.layoutItems, model.contentKey);
    if (!location) {
      throw new ToolValidationError({
        title: "Block not found",
        detail: `No block with contentKey '${model.contentKey}' exists in property '${propertyKey}'`
      });
    }
    if (location.entry.isExternalContent === true) {
      throw new ToolValidationError({
        title: "Block is already in the Library",
        detail: `Block '${model.contentKey}' already references Library Element '${location.entry.contentKey}'`
      });
    }
    const oldKey = location.entry.contentKey;
    const contentIndex = container.contentData.findIndex(b => b.key === oldKey);
    if (contentIndex === -1) {
      throw new ToolValidationError({
        title: "Block data not found",
        detail: `Block '${oldKey}' has a layout entry but no contentData entry`
      });
    }
    const block = container.contentData[contentIndex];

    // RichText markup is computed first so a mismatch fails before anything is created.
    const newKey = uuidv4();
    let newMarkup: string | null = null;
    if (kind === "RichText") {
      newMarkup = rekeyRteBlockElement(ctx.propertyValue.markup ?? "", oldKey, newKey);
      if (newMarkup === null) {
        throw new ToolValidationError({
          title: "Block markup not found",
          detail: `Block '${oldKey}' has a layout entry but no <umb-rte-block> element in the markup`
        });
      }
    }

    // --- Resolve the Element's cultures the way the backoffice does
    const elementType = await client.getDocumentTypeById(block.contentTypeKey);
    const exposedCultures = container.expose.filter(e => e.contentKey === oldKey).map(e => e.culture ?? null);
    let cultures: Array<string | null>;
    let culturesToPublish: Array<string | null>;
    if (!elementType.variesByCulture) {
      cultures = [null];
      culturesToPublish = exposedCultures.length > 0 ? [null] : [];
    } else {
      culturesToPublish = unique(exposedCultures.filter((c): c is string => !!c));
      const valueCultures = block.values
        .filter(v => !isEmptyValue(v.value))
        .map(v => v.culture)
        .filter((c): c is string => !!c);
      cultures = unique([...valueCultures, ...culturesToPublish]);
      if (cultures.length === 0) {
        const fallback = model.culture ?? ctx.document.variants.find(v => !!v.culture)?.culture;
        if (fallback) cultures.push(fallback);
      }
      if (cultures.length === 0) {
        throw new ToolValidationError({
          title: "No culture for the Element",
          detail: `Element type '${block.contentTypeKey}' varies by culture, but the block has no culture to create the Element in; pass culture`
        });
      }
    }

    // --- Create (and publish) the Element
    await client.postElement({
      id: newKey,
      documentType: { id: block.contentTypeKey },
      parent: model.parentId ? { id: model.parentId } : null,
      values: block.values.map(v => ({
        alias: v.alias,
        culture: v.culture ?? null,
        segment: v.segment ?? null,
        value: v.value
      })),
      variants: cultures.map(culture => ({ culture, name: model.name }))
    });

    let publishNote = "left as a draft";
    if (model.publish !== false && culturesToPublish.length > 0) {
      try {
        await client.putElementByIdPublish(newKey, {
          publishSchedules: culturesToPublish.map(culture => ({ culture }))
        });
        publishNote = `published${culturesToPublish[0] ? ` in ${culturesToPublish.join(", ")}` : ""}`;
      } catch (error) {
        // Like the backoffice, the transfer still completes; the Element just stays a draft.
        publishNote = `created but could not be published (${error instanceof Error ? error.message : "unknown error"}); publish it with publish-element`;
      }
    }

    // --- Swap the block for a reference to the Element
    container.contentData.splice(contentIndex, 1);
    for (let i = container.expose.length - 1; i >= 0; i--) {
      if (container.expose[i].contentKey === oldKey) {
        container.expose.splice(i, 1);
      }
    }
    location.entry.contentKey = newKey;
    location.entry.isExternalContent = true;
    if (!location.entry.key) {
      location.entry.key = uuidv4();
    }
    if (newMarkup !== null) {
      ctx.propertyValue.markup = newMarkup;
    }

    try {
      await saveDocumentValues(model.documentId, ctx.document);
    } catch (error) {
      // Don't leave an orphaned Element behind when the document can't be saved.
      await client.deleteElementById(newKey).catch(() => undefined);
      throw error;
    }

    return createToolResult({
      success: true,
      message: `Transferred 1 block in ${kind} property '${propertyKey}' to the Library`,
      results: [{
        success: true,
        contentKey: newKey,
        layoutKey: location.entry.key,
        message: `Created Library Element '${model.name}' (${publishNote}); the block now references it`
      }]
    });
  }),
} satisfies ToolDefinition<typeof transferDocumentBlockToLibrarySchema, typeof transferDocumentBlockToLibraryOutputSchema.shape>;

export default withStandardDecorators(TransferDocumentBlockToLibraryTool);
