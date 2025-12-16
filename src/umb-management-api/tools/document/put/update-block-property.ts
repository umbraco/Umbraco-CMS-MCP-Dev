import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import type {
  DocumentValueModel,
  DocumentVariantRequestModel,
  UpdateDocumentRequestModel
} from "@/umb-management-api/schemas/index.js";
import {
  getAllDocumentTypeProperties,
  validateCultureSegment,
  type ResolvedProperty
} from "./helpers/document-type-properties-resolver.js";
import { validatePropertiesBeforeSave } from "./helpers/property-value-validator.js";
import { matchesProperty, getPropertyKey } from "./helpers/property-matching.js";
import {
  discoverAllBlockArrays,
  findBlockByKey,
  type BlockDataItem
} from "./helpers/block-discovery.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

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

const UpdateBlockPropertyTool = {
  name: "update-block-property",
  description: `Updates or adds property values within BlockList, BlockGrid, or RichText block content.

  This tool enables targeted updates to individual block properties without sending the entire JSON payload.
  You can update existing properties, add new properties, or do both in a single call.
  It automatically handles deep traversal of nested block structures (e.g., RichText blocks containing nested blocks).

  Key features:
  - Update existing properties or add new ones to blocks
  - Property must exist on the Element Type (including compositions)
  - Support for both content and settings blocks
  - Batch updates to multiple blocks in a single call
  - Deep traversal of nested block structures
  - Full i18n support with culture and segment parameters
  - Culture/segment requirements validated against property variance flags

  Example usage:
  - Update a block property: { documentId: "...", propertyAlias: "mainContent", updates: [{ contentKey: "block-uuid", blockType: "content", properties: [{ alias: "title", value: "New Title" }] }] }
  - Add a new property to block: { documentId: "...", propertyAlias: "mainContent", updates: [{ contentKey: "block-uuid", blockType: "content", properties: [{ alias: "newProp", value: "Value" }] }] }
  - Update with culture: { documentId: "...", propertyAlias: "mainContent", culture: "es-ES", updates: [...] }
  - Batch update multiple blocks: { documentId: "...", propertyAlias: "mainContent", updates: [{ contentKey: "uuid1", ... }, { contentKey: "uuid2", ... }] }`,
  schema: updateBlockPropertySchema,
  isReadOnly: false,
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: async (model: UpdateBlockPropertyModel) => {
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
    const results: Array<{
      success: boolean;
      contentKey: string;
      message: string;
      updatedCount?: number;
      addedCount?: number;
      warnings?: string[];
      errors?: string[];
    }> = [];
    const notFoundBlocks: Array<{ contentKey: string; blockType: string }> = [];

    // Cache for Element Type properties (lazy-loaded per contentTypeKey)
    const elementTypePropertiesCache = new Map<string, ResolvedProperty[]>();
    const getElementTypeProperties = async (contentTypeKey: string): Promise<ResolvedProperty[]> => {
      if (!elementTypePropertiesCache.has(contentTypeKey)) {
        try {
          const properties = await getAllDocumentTypeProperties(contentTypeKey);
          elementTypePropertiesCache.set(contentTypeKey, properties);
        } catch (error) {
          console.error(`Failed to fetch Element Type properties for ${contentTypeKey}:`, error);
          elementTypePropertiesCache.set(contentTypeKey, []);
        }
      }
      return elementTypePropertiesCache.get(contentTypeKey)!;
    };

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

      // Process properties within the block
      const warnings: string[] = [];
      const errors: string[] = [];
      let updatedCount = 0;
      let addedCount = 0;

      // Load Element Type properties for validation
      const elementTypeProperties = await getElementTypeProperties(foundBlock.block.contentTypeKey);

      // Validate property values against Data Type configuration before processing
      if (elementTypeProperties.length > 0) {
        const propsToValidate = update.properties
          .map(p => {
            const def = elementTypeProperties.find(d => d.alias === p.alias);
            return { alias: p.alias, value: p.value, dataTypeId: def?.dataTypeId ?? '' };
          })
          .filter(p => p.dataTypeId);

        if (propsToValidate.length > 0) {
          const valueValidation = await validatePropertiesBeforeSave(propsToValidate);
          if (!valueValidation.isValid) {
            errors.push(...valueValidation.errors);
          }
        }
      }

      for (const propUpdate of update.properties) {
        const blockProperty = foundBlock.block.values.find(v =>
          matchesProperty(v, propUpdate.alias, propUpdate.culture, propUpdate.segment)
        );

        if (blockProperty) {
          // Property exists - update it
          blockProperty.value = propUpdate.value;
          updatedCount++;
        } else {
          // Property doesn't exist on block - check if it's valid on Element Type
          // Note: elementTypeProperties is already loaded for value validation above
          const propertyDef = elementTypeProperties.find(p => p.alias === propUpdate.alias);

          if (propertyDef) {
            // Property exists on Element Type - validate culture/segment
            const validationError = validateCultureSegment(propUpdate, propertyDef);
            if (validationError) {
              errors.push(validationError);
            } else {
              // Valid new property - add to block's values
              foundBlock.block.values.push({
                alias: propUpdate.alias,
                culture: propUpdate.culture ?? null,
                segment: propUpdate.segment ?? null,
                value: propUpdate.value
              });
              addedCount++;
            }
          } else if (elementTypeProperties.length > 0) {
            // Property doesn't exist on Element Type
            errors.push(
              `Property '${getPropertyKey(propUpdate.alias, propUpdate.culture, propUpdate.segment)}' does not exist on Element Type`
            );
          } else {
            // Couldn't fetch Element Type - fall back to warning
            warnings.push(
              `Property '${getPropertyKey(propUpdate.alias, propUpdate.culture, propUpdate.segment)}' not found in block (could not validate against Element Type)`
            );
          }
        }
      }

      const totalProcessed = updatedCount + addedCount;
      let message: string;
      if (updatedCount > 0 && addedCount > 0) {
        message = `Updated ${updatedCount} and added ${addedCount} properties in block at ${foundBlock.path}`;
      } else if (addedCount > 0) {
        message = `Added ${addedCount} properties in block at ${foundBlock.path}`;
      } else if (updatedCount > 0) {
        message = `Updated ${updatedCount} properties in block at ${foundBlock.path}`;
      } else {
        message = `No properties were processed in block at ${foundBlock.path}`;
      }

      results.push({
        success: totalProcessed > 0 || errors.length === 0,
        contentKey: update.contentKey,
        message,
        updatedCount: updatedCount > 0 ? updatedCount : undefined,
        addedCount: addedCount > 0 ? addedCount : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        errors: errors.length > 0 ? errors : undefined
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
} satisfies ToolDefinition<typeof updateBlockPropertySchema>;

export default withStandardDecorators(UpdateBlockPropertyTool);
