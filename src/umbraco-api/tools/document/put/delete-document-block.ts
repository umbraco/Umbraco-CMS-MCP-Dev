import { z } from "zod";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { getPropertyKey } from "./helpers/property-matching.js";
import {
  collectNestedAreaContentKeys,
  findLayoutLocation,
  removeBlockFromContainer,
  removeRteBlockElement
} from "./helpers/block-builder.js";
import { loadDocumentBlockContext, saveDocumentValues } from "./helpers/document-block-context.js";
import { updateBlockPropertyOutputSchema } from "./update-block-property.js";
import {
  type ToolDefinition,
  createToolResult,
  ToolValidationError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const deleteDocumentBlockOutputSchema = updateBlockPropertyOutputSchema;

const deleteDocumentBlockSchema = {
  documentId: z.string().uuid().describe("The document containing the block"),
  propertyAlias: z.string().min(1).describe("Document property alias of the BlockList, BlockGrid, or RichText property"),
  culture: z.string().nullish().describe("Culture, only for culture-variant document properties"),
  segment: z.string().nullish().describe("Segment, only for segment-variant document properties"),
  contentKey: z.string().uuid().describe("contentKey of the block to delete"),
};

type DeleteDocumentBlockModel = {
  documentId: string;
  propertyAlias: string;
  culture?: string | null;
  segment?: string | null;
  contentKey: string;
};

const DeleteDocumentBlockTool = {
  name: "delete-document-block",
  description: `Deletes one block from a document's BlockList, BlockGrid, or RichText property.

  Removes the block's contentData entry, its settingsData entry (via the layout settingsKey),
  its expose entries, and its layout entry (and, for RichText, its <umb-rte-block> markup element)
  together in a single document update. Acts on the property's top-level blocks only; BlockGrid
  blocks inside named areas can be deleted too.

  A BlockGrid block whose areas still contain blocks is refused — delete the nested blocks first.
  The document is saved, not published.

  Example: { documentId: "...", propertyAlias: "mainContent", contentKey: "..." }`,
  inputSchema: deleteDocumentBlockSchema,
  outputSchema: deleteDocumentBlockOutputSchema.shape,
  annotations: {
    destructiveHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: (async (model: DeleteDocumentBlockModel) => {
    const ctx = await loadDocumentBlockContext(model);
    const { kind, container } = ctx;

    const location = findLayoutLocation(container.layoutItems, model.contentKey);
    if (!location) {
      throw new ToolValidationError({
        title: "Block not found",
        detail: `No block with contentKey '${model.contentKey}' exists in property '${getPropertyKey(model.propertyAlias, model.culture, model.segment)}'`,
        extensions: {
          availableBlocks: container.contentData.map(b => ({ contentKey: b.key, contentTypeKey: b.contentTypeKey }))
        }
      });
    }

    // Refuse rather than orphan the contentData of blocks nested in this block's areas.
    const nestedKeys = collectNestedAreaContentKeys(location.entry);
    if (nestedKeys.length > 0) {
      throw new ToolValidationError({
        title: "Block has nested blocks",
        detail: `Block '${model.contentKey}' still contains ${nestedKeys.length} block(s) in its areas: ${nestedKeys.join(", ")}. Delete them first.`,
        extensions: { nestedContentKeys: nestedKeys }
      });
    }

    // RichText markup is computed first so a mismatch fails before anything is mutated.
    let newMarkup: string | null = null;
    if (kind === "RichText") {
      newMarkup = removeRteBlockElement(ctx.propertyValue.markup ?? "", model.contentKey);
      if (newMarkup === null) {
        throw new ToolValidationError({
          title: "Block markup not found",
          detail: `Block '${model.contentKey}' has a layout entry but no <umb-rte-block> element in the markup`
        });
      }
    }

    const removed = removeBlockFromContainer(container, location);
    if (!removed) {
      throw new ToolValidationError({
        title: "Block data not found",
        detail: `Block '${model.contentKey}' has a layout entry but no contentData entry`
      });
    }
    if (newMarkup !== null) {
      ctx.propertyValue.markup = newMarkup;
    }

    await saveDocumentValues(model.documentId, ctx.document);

    return createToolResult({
      success: true,
      message: `Deleted 1 block from ${kind} property '${getPropertyKey(model.propertyAlias, model.culture, model.segment)}'`,
      results: [{
        success: true,
        contentKey: model.contentKey,
        message: removed.settingsKey
          ? "Deleted block and its settings"
          : "Deleted block"
      }]
    });
  }),
} satisfies ToolDefinition<typeof deleteDocumentBlockSchema, typeof deleteDocumentBlockOutputSchema.shape>;

export default withStandardDecorators(DeleteDocumentBlockTool);
