import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import type {
  DocumentValueModel,
  DocumentVariantRequestModel,
  UpdateDocumentRequestModel
} from "@/umb-management-api/schemas/index.js";

// Schema definitions
const blockPropertyUpdateSchema = z.object({
  alias: z.string().min(1).describe("The property alias within the block to update"),
  value: z.any().nullish().describe("The new value for the property"),
  culture: z.string().nullish().describe("Optional culture code for variant block properties"),
  segment: z.string().nullish().describe("Optional segment identifier for variant block properties"),
});

const blockUpdateSchema = z.object({
  contentKey: z.string().uuid().describe("The unique key (UUID) identifying the block"),
  blockType: z.enum(["content", "settings"]).describe("'content' for contentData, 'settings' for settingsData"),
  properties: z.array(blockPropertyUpdateSchema).min(1).describe("Properties to update within this block"),
});

const updateBlockPropertySchema = {
  documentId: z.string().uuid().describe("The document containing the block"),
  propertyAlias: z.string().min(1).describe("Document property alias containing BlockList/BlockGrid"),
  culture: z.string().nullish().describe("Optional culture for variant document properties"),
  segment: z.string().nullish().describe("Optional segment for variant document properties"),
  updates: z.array(blockUpdateSchema).min(1).describe("Array of block updates"),
};

type UpdateBlockPropertyModel = {
  documentId: string;
  propertyAlias: string;
  culture?: string | null;
  segment?: string | null;
  updates: Array<{
    contentKey: string;
    blockType: "content" | "settings";
    properties: Array<{
      alias: string;
      value?: any;
      culture?: string | null;
      segment?: string | null;
    }>;
  }>;
};

// Interface for block data items
interface BlockDataItem {
  key: string;
  contentTypeKey: string;
  values: Array<{
    alias: string;
    culture?: string | null;
    segment?: string | null;
    value?: any;
    editorAlias?: string;
  }>;
}

// Interface for discovered block arrays
export interface DiscoveredBlockArrays {
  contentData: BlockDataItem[];
  settingsData: BlockDataItem[];
  path: string;
}

/**
 * Helper to match a property by alias, culture, and segment
 */
function matchesProperty(
  value: { alias: string; culture?: string | null; segment?: string | null },
  alias: string,
  culture?: string | null,
  segment?: string | null
): boolean {
  return value.alias === alias &&
    (value.culture ?? null) === (culture ?? null) &&
    (value.segment ?? null) === (segment ?? null);
}

/**
 * Helper to create a property key for error reporting
 */
function getPropertyKey(alias: string, culture?: string | null, segment?: string | null): string {
  let key = alias;
  if (culture) key += `[${culture}]`;
  if (segment) key += `[${segment}]`;
  return key;
}

/**
 * Recursively discovers all block arrays (contentData and settingsData) in a value structure.
 * This handles nested blocks in RichText editors and deeply nested block structures.
 *
 * @param value - The value to search within
 * @param path - The current path (for debugging/error messages)
 * @returns Array of discovered block arrays with their paths
 */
export function discoverAllBlockArrays(value: any, path: string = "root"): DiscoveredBlockArrays[] {
  const results: DiscoveredBlockArrays[] = [];

  // Base case: null, undefined, or not an object
  if (!value || typeof value !== "object") {
    return results;
  }

  // Check if this value has contentData and settingsData arrays
  if (Array.isArray(value.contentData) && Array.isArray(value.settingsData)) {
    results.push({
      contentData: value.contentData,
      settingsData: value.settingsData,
      path
    });

    // Now recursively check each block in contentData for nested structures
    value.contentData.forEach((block: BlockDataItem, index: number) => {
      if (block.values && Array.isArray(block.values)) {
        block.values.forEach((prop: any, propIndex: number) => {
          const propPath = `${path}.contentData[${index}].values[${propIndex}](${prop.alias})`;

          // Check for RichText blocks structure
          if (prop.value && typeof prop.value === "object" && prop.value.blocks) {
            const nestedResults = discoverAllBlockArrays(prop.value.blocks, `${propPath}.blocks`);
            results.push(...nestedResults);
          }

          // Check for direct nested block structures
          if (prop.value && typeof prop.value === "object") {
            const nestedResults = discoverAllBlockArrays(prop.value, propPath);
            results.push(...nestedResults);
          }
        });
      }
    });

    // Check settingsData blocks too
    value.settingsData.forEach((block: BlockDataItem, index: number) => {
      if (block.values && Array.isArray(block.values)) {
        block.values.forEach((prop: any, propIndex: number) => {
          const propPath = `${path}.settingsData[${index}].values[${propIndex}](${prop.alias})`;

          // Check for nested structures in settings
          if (prop.value && typeof prop.value === "object") {
            const nestedResults = discoverAllBlockArrays(prop.value, propPath);
            results.push(...nestedResults);
          }
        });
      }
    });
  }

  return results;
}

/**
 * Find a block by contentKey across all discovered block arrays
 */
function findBlockByKey(
  discoveredArrays: DiscoveredBlockArrays[],
  contentKey: string,
  blockType: "content" | "settings"
): { block: BlockDataItem; arrayRef: BlockDataItem[]; path: string } | null {
  for (const discovered of discoveredArrays) {
    const array = blockType === "content" ? discovered.contentData : discovered.settingsData;
    const block = array.find((b: BlockDataItem) => b.key === contentKey);
    if (block) {
      return { block, arrayRef: array, path: discovered.path };
    }
  }
  return null;
}

const UpdateBlockPropertyTool = CreateUmbracoTool(
  "update-block-property",
  `Updates specific property values within BlockList, BlockGrid, or RichText block content.

  This tool enables targeted updates to individual block properties without sending the entire JSON payload.
  It automatically handles deep traversal of nested block structures (e.g., RichText blocks containing nested blocks).

  Key features:
  - Update properties in specific blocks by contentKey (UUID)
  - Support for both content and settings blocks
  - Batch updates to multiple blocks in a single call
  - Deep traversal of nested block structures
  - Full i18n support with culture and segment parameters

  Example usage:
  - Update a block property: { documentId: "...", propertyAlias: "mainContent", updates: [{ contentKey: "block-uuid", blockType: "content", properties: [{ alias: "title", value: "New Title" }] }] }
  - Update with culture: { documentId: "...", propertyAlias: "mainContent", culture: "es-ES", updates: [...] }
  - Batch update multiple blocks: { documentId: "...", propertyAlias: "mainContent", updates: [{ contentKey: "uuid1", ... }, { contentKey: "uuid2", ... }] }`,
  updateBlockPropertySchema,
  async (model: UpdateBlockPropertyModel) => {
    const client = UmbracoManagementClient.getClient();

    // Step 1: Fetch the current document
    const currentDocument = await client.getDocumentById(model.documentId);

    // Step 2: Find the property containing the block structure
    const documentProperty = currentDocument.values.find(v =>
      matchesProperty(v, model.propertyAlias, model.culture, model.segment)
    );

    if (!documentProperty) {
      const availableAliases = currentDocument.values.map(v => ({
        alias: v.alias,
        culture: v.culture ?? null,
        segment: v.segment ?? null,
        editorAlias: v.editorAlias
      }));

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: "Property not found",
            message: `Property '${getPropertyKey(model.propertyAlias, model.culture, model.segment)}' does not exist on this document`,
            availableProperties: availableAliases
          }, null, 2)
        }]
      };
    }

    // Step 3: Discover all block arrays via deep traversal
    const discoveredArrays = discoverAllBlockArrays(documentProperty.value, `property(${model.propertyAlias})`);

    if (discoveredArrays.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: "No block structure found",
            message: `Property '${model.propertyAlias}' does not contain a BlockList, BlockGrid, or RichText block structure`,
            propertyValue: documentProperty.value
          }, null, 2)
        }]
      };
    }

    // Step 4: Process updates
    const results: Array<{ success: boolean; contentKey: string; message: string; warnings?: string[] }> = [];
    const notFoundBlocks: Array<{ contentKey: string; blockType: string }> = [];

    for (const update of model.updates) {
      const foundBlock = findBlockByKey(discoveredArrays, update.contentKey, update.blockType);

      if (!foundBlock) {
        notFoundBlocks.push({ contentKey: update.contentKey, blockType: update.blockType });
        results.push({
          success: false,
          contentKey: update.contentKey,
          message: `Block with contentKey '${update.contentKey}' not found in ${update.blockType}Data`
        });
        continue;
      }

      // Update properties within the block
      const warnings: string[] = [];
      let updatedCount = 0;

      for (const propUpdate of update.properties) {
        const blockProperty = foundBlock.block.values.find(v =>
          matchesProperty(v, propUpdate.alias, propUpdate.culture, propUpdate.segment)
        );

        if (!blockProperty) {
          warnings.push(
            `Property '${getPropertyKey(propUpdate.alias, propUpdate.culture, propUpdate.segment)}' not found in block`
          );
          continue;
        }

        // Update the property value
        blockProperty.value = propUpdate.value;
        updatedCount++;
      }

      results.push({
        success: updatedCount > 0,
        contentKey: update.contentKey,
        message: `Updated ${updatedCount} of ${update.properties.length} properties in block at ${foundBlock.path}`,
        warnings: warnings.length > 0 ? warnings : undefined
      });
    }

    // If all blocks failed to be found, return detailed error
    if (notFoundBlocks.length === model.updates.length) {
      const allBlocks = discoveredArrays.flatMap(d => [
        ...d.contentData.map((b: BlockDataItem) => ({ key: b.key, type: "content", path: d.path })),
        ...d.settingsData.map((b: BlockDataItem) => ({ key: b.key, type: "settings", path: d.path }))
      ]);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: "Blocks not found",
            message: "None of the specified blocks were found in the document",
            notFoundBlocks,
            availableBlocks: allBlocks
          }, null, 2)
        }]
      };
    }

    // Step 5: Prepare updated values array (strip editorAlias as it's read-only)
    const updatedValues: DocumentValueModel[] = currentDocument.values.map(existingValue => ({
      alias: existingValue.alias,
      culture: existingValue.culture,
      segment: existingValue.segment,
      value: existingValue.value
    }));

    // Step 6: Convert variants from response format to request format
    const variants: DocumentVariantRequestModel[] = currentDocument.variants.map(v => ({
      culture: v.culture,
      segment: v.segment,
      name: v.name
    }));

    // Step 7: Build the update payload
    const updatePayload: UpdateDocumentRequestModel = {
      values: updatedValues,
      variants: variants,
      template: currentDocument.template
    };

    // Step 8: Update the document
    await client.putDocumentById(model.documentId, updatePayload);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          message: `Successfully processed ${model.updates.length} block update(s)`,
          results
        }, null, 2)
      }]
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update)
);

export default UpdateBlockPropertyTool;
