import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import type {
  DocumentResponseModel,
  DocumentValueModel,
  DocumentVariantRequestModel,
  UpdateDocumentRequestModel
} from "@/umb-management-api/schemas/index.js";

// Define the property schema for reuse
const propertySchema = z.object({
  alias: z.string().min(1).describe("The property alias to update"),
  value: z.any().nullish().describe("The new value for the property"),
  culture: z.string().nullish().describe("Optional culture code for variant properties (e.g., 'en-US')"),
  segment: z.string().nullish().describe("Optional segment identifier for variant properties"),
});

// Define the input schema
const updateDocumentPropertiesSchema = {
  id: z.string().uuid().describe("The unique identifier of the document to update"),
  properties: z.array(propertySchema).min(1).describe("Array of properties to update - at least one property is required")
};

type UpdateDocumentPropertiesModel = {
  id: string;
  properties: Array<{
    alias: string;
    value?: any;
    culture?: string | null;
    segment?: string | null;
  }>;
};

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

const UpdateDocumentPropertiesTool = CreateUmbracoTool(
  "update-document-properties",
  `Updates specific property values on a document without requiring the full document JSON payload.

  This tool simplifies property updates by handling the read-modify-write cycle internally.
  You can update multiple properties in a single call, with full support for culture and segment variants.

  Key features:
  - Update multiple properties at once
  - Full i18n support with culture and segment parameters
  - Automatic validation of property aliases
  - Returns detailed error messages if any property doesn't exist

  Example usage:
  - Update a single property: { id: "...", properties: [{ alias: "title", value: "New Title" }] }
  - Update with culture: { id: "...", properties: [{ alias: "title", value: "Nuevo Título", culture: "es-ES" }] }
  - Update multiple properties: { id: "...", properties: [{ alias: "title", value: "New Title" }, { alias: "description", value: "New Desc" }] }`,
  updateDocumentPropertiesSchema,
  async (model: UpdateDocumentPropertiesModel) => {
    const client = UmbracoManagementClient.getClient();

    // Step 1: Fetch the current document
    const currentDocument = await client.getDocumentById(model.id);

    // Step 2: Validate all provided aliases exist
    const invalidAliases: string[] = [];
    const validatedProperties: Array<{
      alias: string;
      value: any;
      culture?: string | null;
      segment?: string | null;
    }> = [];

    for (const prop of model.properties) {
      const exists = currentDocument.values.some(v =>
        matchesProperty(v, prop.alias, prop.culture, prop.segment)
      );

      if (!exists) {
        invalidAliases.push(getPropertyKey(prop.alias, prop.culture, prop.segment));
      } else {
        validatedProperties.push({
          alias: prop.alias,
          value: prop.value,
          culture: prop.culture,
          segment: prop.segment
        });
      }
    }

    // Step 3: If any aliases are invalid, return error with available aliases
    if (invalidAliases.length > 0) {
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
            error: "Invalid property aliases",
            message: `The following properties do not exist on this document: ${invalidAliases.join(", ")}`,
            invalidAliases,
            availableAliases
          }, null, 2)
        }]
      };
    }

    // Step 4: Merge the updated properties with existing values
    const updatedValues: DocumentValueModel[] = currentDocument.values.map(existingValue => {
      // Find if this property should be updated
      const updateProp = validatedProperties.find(p =>
        matchesProperty(existingValue, p.alias, p.culture, p.segment)
      );

      if (updateProp) {
        // Return updated property (strip editorAlias as it's read-only)
        return {
          alias: existingValue.alias,
          culture: existingValue.culture,
          segment: existingValue.segment,
          value: updateProp.value
        };
      }

      // Return unchanged property (strip editorAlias as it's read-only)
      return {
        alias: existingValue.alias,
        culture: existingValue.culture,
        segment: existingValue.segment,
        value: existingValue.value
      };
    });

    // Step 5: Convert variants from response format to request format
    const variants: DocumentVariantRequestModel[] = currentDocument.variants.map(v => ({
      culture: v.culture,
      segment: v.segment,
      name: v.name
    }));

    // Step 6: Build the update payload
    const updatePayload: UpdateDocumentRequestModel = {
      values: updatedValues,
      variants: variants,
      template: currentDocument.template
    };

    // Step 7: Update the document
    await client.putDocumentById(model.id, updatePayload);

    // Step 8: Re-fetch the document to return the updated state
    const updatedDocument = await client.getDocumentById(model.id);

    // Step 9: Build list of updated property keys for the success message
    const updatedPropertyKeys = validatedProperties.map(p =>
      getPropertyKey(p.alias, p.culture, p.segment)
    );

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          message: `Successfully updated ${validatedProperties.length} property value(s)`,
          updatedProperties: updatedPropertyKeys,
          document: updatedDocument
        }, null, 2)
      }]
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update)
);

export default UpdateDocumentPropertiesTool;
