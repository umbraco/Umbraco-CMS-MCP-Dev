import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  getAllDocumentTypeProperties,
  validateCultureSegment
} from "./helpers/document-type-properties-resolver.js";
import { getPropertyKey } from "./helpers/property-matching.js";
import {
  buildBlockEntry,
  buildExposeEntries,
  buildLayoutEntry,
  buildRteBlockElement,
  checkAllowedInArea,
  findAreaConfiguration,
  findBlockTypeConfiguration,
  findLayoutLocation,
  insertAtPosition,
  insertRteBlockElement,
  type BlockGridAreaConfiguration,
  type BlockLayoutItem,
  type BlockPlacement,
  type BlockPropertyValueInput
} from "./helpers/block-builder.js";
import { loadDocumentBlockContext, saveDocumentValues } from "./helpers/document-block-context.js";
import { updateBlockPropertyOutputSchema } from "./update-block-property.js";
import {
  type ToolDefinition,
  createToolResult,
  ToolValidationError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const createDocumentBlockOutputSchema = updateBlockPropertyOutputSchema;

const blockPropertyValueSchema = z.object({
  alias: z.string().min(1).describe("The property alias on the block's element type"),
  value: z.any().nullish().describe("The property value"),
  culture: z.string().nullish().describe("Culture code, only for culture-variant element type properties"),
  segment: z.string().nullish().describe("Segment, only for segment-variant element type properties"),
});

const placementSchema = z.object({
  position: z.enum(["before", "after", "append", "prepend"])
    .describe("'before'/'after' an existing sibling block (requires contentKey), or 'append'/'prepend' to the target container"),
  contentKey: z.string().uuid().nullish()
    .describe("contentKey of the existing sibling block, required for 'before'/'after'"),
}).refine(
  p => (p.position !== "before" && p.position !== "after") || !!p.contentKey,
  { message: "contentKey is required when position is 'before' or 'after'", path: ["contentKey"] }
);

const gridSchema = z.object({
  columnSpan: z.number().int().positive().optional().describe("BlockGrid column span (default 12)"),
  rowSpan: z.number().int().positive().optional().describe("BlockGrid row span (default 1)"),
  areaKey: z.string().uuid().optional().describe("Key of the named area to insert into (requires parentContentKey)"),
  parentContentKey: z.string().uuid().optional().describe("contentKey of the block that owns the area (requires areaKey)"),
}).refine(
  g => !!g.areaKey === !!g.parentContentKey,
  { message: "areaKey and parentContentKey must be provided together", path: ["parentContentKey"] }
);

const createDocumentBlockSchema = {
  documentId: z.string().uuid().describe("The document to add the block to"),
  propertyAlias: z.string().min(1).describe("Document property alias of the BlockList, BlockGrid, or RichText property"),
  culture: z.string().nullish().describe("Culture, only for culture-variant document properties"),
  segment: z.string().nullish().describe("Segment, only for segment-variant document properties"),
  contentTypeKey: z.string().uuid().describe("Element type key of the new block; must be allowed by the property's data type"),
  properties: z.array(blockPropertyValueSchema).optional().describe("Content property values for the new block"),
  settings: z.object({
    properties: z.array(blockPropertyValueSchema).describe("Settings property values"),
  }).optional().describe("Settings for the new block; the settings element type comes from the data type configuration"),
  placement: placementSchema.optional().describe("Where to place the block relative to siblings (default: append)"),
  grid: gridSchema.optional().describe("BlockGrid-only layout options. Rejected for BlockList/RichText properties"),
};

type CreateDocumentBlockModel = {
  documentId: string;
  propertyAlias: string;
  culture?: string | null;
  segment?: string | null;
  contentTypeKey: string;
  properties?: BlockPropertyValueInput[];
  settings?: { properties: BlockPropertyValueInput[] };
  placement?: { position: "before" | "after" | "append" | "prepend"; contentKey?: string | null };
  grid?: { columnSpan?: number; rowSpan?: number; areaKey?: string; parentContentKey?: string };
};

/**
 * Validates block property values against an element type (including compositions).
 */
async function validateBlockProperties(
  elementTypeKey: string,
  properties: BlockPropertyValueInput[],
  label: string
): Promise<string[]> {
  if (properties.length === 0) {
    return [];
  }
  const definitions = await getAllDocumentTypeProperties(elementTypeKey);
  const errors: string[] = [];
  for (const prop of properties) {
    const def = definitions.find(d => d.alias === prop.alias);
    if (!def) {
      errors.push(`${label} property '${getPropertyKey(prop.alias, prop.culture, prop.segment)}' does not exist on element type '${elementTypeKey}'`);
      continue;
    }
    const varianceError = validateCultureSegment(prop, def);
    if (varianceError) {
      errors.push(`${label}: ${varianceError}`);
    }
  }
  return errors;
}

const CreateDocumentBlockTool = {
  name: "create-document-block",
  description: `Creates (inserts) one new block in a document's BlockList, BlockGrid, or RichText property.

  Writes the block's contentData (and settingsData), its expose entries, and its layout entry
  (and, for RichText, the <umb-rte-block> markup element) together in a single document update,
  so the block renders without any hand-assembled JSON. Acts on the property's top-level blocks only.

  - contentTypeKey must be an element type allowed by the property's data type (and by the target area for BlockGrid).
  - placement is sibling-relative: { position: "before" | "after", contentKey: "<existing block>" }, or
    { position: "append" | "prepend" } (default append). For BlockGrid, append/prepend targets the root,
    or the named area given in grid.
  - grid (BlockGrid only): columnSpan (default 12), rowSpan (default 1), and areaKey + parentContentKey
    to insert into a named area of an existing block.
  - New block keys are generated; the result returns the new contentKey.
  - The document is saved, not published.

  Example: { documentId: "...", propertyAlias: "mainContent", contentTypeKey: "...",
    properties: [{ alias: "title", value: "Hello" }], placement: { position: "after", contentKey: "..." } }`,
  inputSchema: createDocumentBlockSchema,
  outputSchema: createDocumentBlockOutputSchema.shape,
  annotations: {
    idempotentHint: false,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: (async (model: CreateDocumentBlockModel) => {
    const client = UmbracoManagementClient.getClient();
    const ctx = await loadDocumentBlockContext(model);
    const { kind, container, blockConfigs } = ctx;
    const placement = (model.placement ?? { position: "append" }) as BlockPlacement;
    const contentProperties = model.properties ?? [];
    const settingsProperties = model.settings?.properties ?? [];

    // --- Validate grid options against the editor kind
    if (model.grid && kind !== "BlockGrid") {
      throw new ToolValidationError({
        title: "grid options not supported",
        detail: `'grid' only applies to BlockGrid properties; '${model.propertyAlias}' is a ${kind} property`
      });
    }
    const areaKey = model.grid?.areaKey;
    const parentContentKey = model.grid?.parentContentKey;
    // Also enforced by gridSchema; kept as a guard for callers that bypass schema validation.
    if (!!areaKey !== !!parentContentKey) {
      throw new ToolValidationError({
        title: "Incomplete area target",
        detail: "grid.areaKey and grid.parentContentKey must be provided together"
      });
    }

    // --- Validate the element type against the data type's block configuration
    const blockConfig = findBlockTypeConfiguration(blockConfigs, model.contentTypeKey);
    if (!blockConfig) {
      throw new ToolValidationError({
        title: "Element type not allowed",
        detail: `Element type '${model.contentTypeKey}' is not configured as a block on property '${model.propertyAlias}'`,
        extensions: {
          allowedBlocks: blockConfigs.map(c => ({ contentTypeKey: c.contentElementTypeKey, label: c.label ?? null }))
        }
      });
    }
    if (model.settings && !blockConfig.settingsElementTypeKey) {
      throw new ToolValidationError({
        title: "Settings not supported",
        detail: `Block type '${model.contentTypeKey}' has no settings element type configured`
      });
    }

    const propertyErrors = [
      ...(await validateBlockProperties(model.contentTypeKey, contentProperties, "Content")),
      ...(blockConfig.settingsElementTypeKey
        ? await validateBlockProperties(blockConfig.settingsElementTypeKey, settingsProperties, "Settings")
        : [])
    ];
    if (propertyErrors.length > 0) {
      throw new ToolValidationError({
        title: "Invalid block properties",
        detail: propertyErrors.join("; "),
        extensions: { errors: propertyErrors }
      });
    }

    // --- Resolve the target layout array
    let targetItems: BlockLayoutItem[] = container.layoutItems;
    let targetArea: BlockGridAreaConfiguration | null = null;

    const resolveArea = (parent: BlockLayoutItem, key: string): { items: BlockLayoutItem[]; config: BlockGridAreaConfiguration } => {
      const parentBlock = container.contentData.find(b => b.key === parent.contentKey);
      if (!parentBlock) {
        throw new ToolValidationError({
          title: "Parent block not found",
          detail: `Block '${parent.contentKey}' is in the layout but has no contentData entry`
        });
      }
      // Area configuration lives on the data type's block configuration, not on the element type.
      const config = findAreaConfiguration(blockConfigs, parentBlock.contentTypeKey, key);
      if (!config) {
        throw new ToolValidationError({
          title: "Area not found",
          detail: `Area '${key}' is not configured for block type '${parentBlock.contentTypeKey}'`,
          extensions: {
            availableAreas: (findBlockTypeConfiguration(blockConfigs, parentBlock.contentTypeKey)?.areas ?? [])
              .map(a => ({ key: a.key, alias: a.alias ?? null }))
          }
        });
      }
      parent.areas = Array.isArray(parent.areas) ? parent.areas : [];
      let area = parent.areas.find(a => a.key === key);
      if (!area) {
        area = { key, items: [] };
        parent.areas.push(area);
      }
      area.items = Array.isArray(area.items) ? area.items : [];
      return { items: area.items, config };
    };

    if (kind === "BlockGrid") {
      if (placement.position === "before" || placement.position === "after") {
        const sibling = findLayoutLocation(container.layoutItems, placement.contentKey);
        if (!sibling) {
          throw new ToolValidationError({
            title: "Sibling block not found",
            detail: `No block with contentKey '${placement.contentKey}' exists in property '${model.propertyAlias}'`
          });
        }
        if (areaKey && (sibling.areaKey !== areaKey || sibling.parent?.contentKey !== parentContentKey)) {
          throw new ToolValidationError({
            title: "Sibling not in target area",
            detail: `Block '${placement.contentKey}' is not in area '${areaKey}' of block '${parentContentKey}'`
          });
        }
        targetItems = sibling.items;
        if (sibling.parent && sibling.areaKey) {
          targetArea = resolveArea(sibling.parent, sibling.areaKey).config;
        }
      } else if (areaKey && parentContentKey) {
        const parent = findLayoutLocation(container.layoutItems, parentContentKey);
        if (!parent) {
          throw new ToolValidationError({
            title: "Parent block not found",
            detail: `No block with contentKey '${parentContentKey}' exists in property '${model.propertyAlias}'`
          });
        }
        const resolved = resolveArea(parent.entry, areaKey);
        targetItems = resolved.items;
        targetArea = resolved.config;
      }

      if (targetArea) {
        const notAllowed = checkAllowedInArea(blockConfig, targetArea);
        if (notAllowed) {
          throw new ToolValidationError({ title: "Element type not allowed in area", detail: notAllowed });
        }
        if (targetArea.maxAllowed != null && targetItems.length >= targetArea.maxAllowed) {
          throw new ToolValidationError({
            title: "Area is full",
            detail: `Area '${targetArea.alias ?? targetArea.key}' allows at most ${targetArea.maxAllowed} block(s)`
          });
        }
      } else if (blockConfig.allowAtRoot === false) {
        throw new ToolValidationError({
          title: "Element type not allowed at root",
          detail: `Element type '${model.contentTypeKey}' is not allowed at the root of this BlockGrid; insert it into an area instead`
        });
      }
    }

    // --- Build the new block
    const contentKey = uuidv4();
    const settingsKey = model.settings ? uuidv4() : null;
    const layoutEntry = buildLayoutEntry(kind, {
      contentKey,
      settingsKey,
      columnSpan: model.grid?.columnSpan,
      rowSpan: model.grid?.rowSpan,
      areaKeys: (blockConfig.areas ?? []).map(a => a.key)
    });

    // Expose per culture when the element type varies by culture; otherwise invariant.
    const elementType = await client.getDocumentTypeById(model.contentTypeKey);
    let exposeCultures: Array<string | null> = [null];
    if (elementType.variesByCulture) {
      if (model.culture) {
        exposeCultures = [model.culture];
      } else {
        const valueCultures = contentProperties.map(p => p.culture).filter((c): c is string => !!c);
        const documentCultures = ctx.document.variants.map(v => v.culture).filter((c): c is string => !!c);
        exposeCultures = valueCultures.length > 0 ? valueCultures : documentCultures.length > 0 ? documentCultures : [null];
      }
    }
    const exposeSegment = elementType.variesBySegment ? (model.segment ?? null) : null;

    // RichText markup must be computed before mutating anything, so a missing sibling fails cleanly.
    let newMarkup: string | null = null;
    if (kind === "RichText") {
      const inline = blockConfig.displayInline === true;
      newMarkup = insertRteBlockElement(
        ctx.propertyValue.markup ?? "",
        buildRteBlockElement(contentKey, inline),
        placement,
        inline
      );
      if (newMarkup === null) {
        throw new ToolValidationError({
          title: "Sibling block not found",
          detail: `No block element with contentKey '${placement.contentKey}' exists in the RichText markup`
        });
      }
    }

    if (!insertAtPosition(targetItems, layoutEntry, placement, i => i.contentKey)) {
      throw new ToolValidationError({
        title: "Sibling block not found",
        detail: `No block with contentKey '${placement.contentKey}' exists in property '${model.propertyAlias}'`
      });
    }

    // --- Write contentData, settingsData, expose (and markup) together
    container.contentData.push(buildBlockEntry(contentKey, model.contentTypeKey, contentProperties));
    if (settingsKey && blockConfig.settingsElementTypeKey) {
      container.settingsData.push(buildBlockEntry(settingsKey, blockConfig.settingsElementTypeKey, settingsProperties));
    }
    container.expose.push(...buildExposeEntries(contentKey, exposeCultures, exposeSegment));
    if (newMarkup !== null) {
      ctx.propertyValue.markup = newMarkup;
    }

    await saveDocumentValues(model.documentId, ctx.document);

    return createToolResult({
      success: true,
      message: `Created 1 block in ${kind} property '${getPropertyKey(model.propertyAlias, model.culture, model.segment)}'`,
      results: [{
        success: true,
        contentKey,
        message: settingsKey
          ? "Created block with settings"
          : "Created block"
      }]
    });
  }),
} satisfies ToolDefinition<typeof createDocumentBlockSchema, typeof createDocumentBlockOutputSchema.shape>;

export default withStandardDecorators(CreateDocumentBlockTool);
