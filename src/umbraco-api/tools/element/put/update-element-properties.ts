import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import { UmbracoElementPermissions } from "../constants.js";
import type {
  ElementValueModel,
  ElementVariantRequestModel,
  UpdateElementRequestModel
} from "@/umbraco-api/schemas/index.js";
import {
  getAllDocumentTypeProperties,
  validateCultureSegment,
  type ResolvedProperty
} from "../../document/put/helpers/document-type-properties-resolver.js";
import { matchesProperty, getPropertyKey } from "../../document/put/helpers/property-matching.js";
import {
  type ToolDefinition,
  createToolResult,
  ToolValidationError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const updateElementPropertiesOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  updatedProperties: z.array(z.string()),
  addedProperties: z.array(z.string()),
  element: z.any().describe(
    "The updated element state, computed locally from the pre-update read plus the applied changes " +
    "(no fresh server fetch after the write). Per-value editorAlias and per-variant server metadata " +
    "(id, createDate, updateDate, state) reflect the pre-update read rather than the server's post-update state."
  ),
});

const propertySchema = z.object({
  alias: z.string().min(1).describe("The property alias to update or add"),
  value: z.any().nullish().describe("The new value for the property"),
  culture: z.string().nullish().describe("Optional culture code for variant properties (e.g., 'en-US')"),
  segment: z.string().nullish().describe("Optional segment identifier for variant properties"),
});

const updateElementPropertiesSchema = {
  id: z.string().uuid().describe("The unique identifier of the element to update"),
  properties: z.array(propertySchema).min(1).describe("Array of properties to update or add - at least one property is required")
};

type UpdateElementPropertiesModel = {
  id: string;
  properties: Array<{
    alias: string;
    value?: any;
    culture?: string | null;
    segment?: string | null;
  }>;
};

const UpdateElementPropertiesTool = {
  name: "update-element-properties",
  description: `Updates or adds property values on an element without requiring the full element JSON payload.

  This tool simplifies property updates by handling the read-modify-write cycle internally.
  You can update existing properties, add new properties, or do both in a single call.

  Key features:
  - Update existing properties or add new ones
  - Property must exist on the element type (including compositions)
  - Full i18n support with culture and segment parameters
  - Automatic validation of property aliases against element type
  - Culture/segment requirements validated against property variance flags
  - Returns detailed error messages with available properties

  Example usage:
  - Update a single property: { id: "...", properties: [{ alias: "title", value: "New Title" }] }
  - Add a new property: { id: "...", properties: [{ alias: "author", value: "John Doe" }] }
  - Update with culture: { id: "...", properties: [{ alias: "title", value: "Nuevo Título", culture: "es-ES" }] }
  - Mix update and add: { id: "...", properties: [{ alias: "title", value: "New" }, { alias: "newProp", value: "Value" }] }`,
  inputSchema: updateElementPropertiesSchema,
  outputSchema: updateElementPropertiesOutputSchema.shape,
  annotations: {
    idempotentHint: true,
  },
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Update),
  handler: (async (model: UpdateElementPropertiesModel) => {
    const client = UmbracoManagementClient.getClient();

    // Step 1: Fetch the current element
    const currentElement = await client.getElementById(model.id);

    // Step 2: Validate and categorize properties
    const invalidAliases: string[] = [];
    const varianceErrors: string[] = [];
    const propertiesToUpdate: Array<{
      alias: string;
      value: any;
      culture?: string | null;
      segment?: string | null;
    }> = [];
    const propertiesToAdd: Array<{
      alias: string;
      value: any;
      culture?: string | null;
      segment?: string | null;
    }> = [];

    // Lazy-load element type properties only if needed (for adding new properties)
    let elementTypeProperties: ResolvedProperty[] | null = null;
    const getElementTypeProperties = async (): Promise<ResolvedProperty[]> => {
      if (elementTypeProperties === null) {
        try {
          elementTypeProperties = await getAllDocumentTypeProperties(currentElement.documentType.id);
        } catch (error) {
          console.error("Failed to fetch element type properties:", error);
          elementTypeProperties = [];
        }
      }
      return elementTypeProperties;
    };

    for (const prop of model.properties) {
      // Check if property exists on element (update case)
      const existsOnElement = currentElement.values.some(v =>
        matchesProperty(v, prop.alias, prop.culture, prop.segment)
      );

      if (existsOnElement) {
        // Property exists - this is an update
        propertiesToUpdate.push({
          alias: prop.alias,
          value: prop.value,
          culture: prop.culture,
          segment: prop.segment
        });
      } else {
        // Property doesn't exist on element - check if it's valid on element type
        const elemTypeProperties = await getElementTypeProperties();
        const propertyDef = elemTypeProperties.find(p => p.alias === prop.alias);

        if (propertyDef) {
          // Property exists on element type - validate culture/segment
          const validationError = validateCultureSegment(prop, propertyDef);
          if (validationError) {
            varianceErrors.push(validationError);
          } else {
            // Valid new property to add
            propertiesToAdd.push({
              alias: prop.alias,
              value: prop.value,
              culture: prop.culture,
              segment: prop.segment
            });
          }
        } else if (elemTypeProperties.length > 0) {
          // Property doesn't exist on element type
          invalidAliases.push(getPropertyKey(prop.alias, prop.culture, prop.segment));
        } else {
          // Couldn't fetch element type - fall back to old behavior (invalid)
          invalidAliases.push(getPropertyKey(prop.alias, prop.culture, prop.segment));
        }
      }
    }

    // Step 3: Return error if there are validation issues
    if (varianceErrors.length > 0) {
      throw new ToolValidationError({
        title: "Culture/segment validation failed",
        detail: varianceErrors.join("; "),
        extensions: {
          errors: varianceErrors,
          availableProperties: (elementTypeProperties ?? [] as ResolvedProperty[]).map(p => ({
            alias: p.alias,
            name: p.name,
            variesByCulture: p.variesByCulture,
            variesBySegment: p.variesBySegment
          }))
        }
      });
    }

    if (invalidAliases.length > 0) {
      const elemTypeProps = elementTypeProperties ?? [] as ResolvedProperty[];
      const availableProperties = elemTypeProps.length > 0
        ? elemTypeProps.map(p => ({
            alias: p.alias,
            name: p.name,
            variesByCulture: p.variesByCulture,
            variesBySegment: p.variesBySegment
          }))
        : currentElement.values.map(v => ({
            alias: v.alias,
            culture: v.culture ?? null,
            segment: v.segment ?? null,
            editorAlias: v.editorAlias
          }));

      throw new ToolValidationError({
        title: "Invalid property aliases",
        detail: `The following properties do not exist on this element type: ${invalidAliases.join(", ")}`,
        extensions: {
          invalidAliases,
          availableProperties
        }
      });
    }

    // Step 5: Merge updated properties with existing values
    const updatedValues: ElementValueModel[] = currentElement.values.map(existingValue => {
      // Find if this property should be updated
      const updateProp = propertiesToUpdate.find(p =>
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

    // Step 6: Add new properties
    for (const newProp of propertiesToAdd) {
      updatedValues.push({
        alias: newProp.alias,
        culture: newProp.culture ?? null,
        segment: newProp.segment ?? null,
        value: newProp.value
      });
    }

    // Step 7: Convert variants from response format to request format
    const variants: ElementVariantRequestModel[] = currentElement.variants.map(v => ({
      culture: v.culture,
      segment: v.segment,
      name: v.name
    }));

    // Step 8: Build the update payload (elements have no template)
    const updatePayload: UpdateElementRequestModel = {
      values: updatedValues,
      variants: variants,
    };

    // Step 9: Update the element
    await client.putElementById(model.id, updatePayload);

    // Step 10: Build the returned element state from data already in memory
    // (the initial fetch plus the updates just applied) instead of re-fetching
    // the element from the server. This avoids a redundant GET round-trip on
    // every successful call; the trade-off is that per-value `editorAlias` and
    // per-variant server metadata (id, dates, state) reflect the pre-update
    // read rather than a fresh server response.
    const updatedElement = {
      id: currentElement.id,
      documentType: currentElement.documentType,
      isTrashed: currentElement.isTrashed,
      flags: currentElement.flags,
      values: updatedValues,
      variants: variants,
    };

    // Step 11: Build lists for the success message
    const updatedPropertyKeys = propertiesToUpdate.map(p =>
      getPropertyKey(p.alias, p.culture, p.segment)
    );
    const addedPropertyKeys = propertiesToAdd.map(p =>
      getPropertyKey(p.alias, p.culture, p.segment)
    );

    const totalCount = propertiesToUpdate.length + propertiesToAdd.length;
    let message = `Successfully processed ${totalCount} property value(s)`;
    if (propertiesToUpdate.length > 0 && propertiesToAdd.length > 0) {
      message = `Successfully updated ${propertiesToUpdate.length} and added ${propertiesToAdd.length} property value(s)`;
    } else if (propertiesToAdd.length > 0) {
      message = `Successfully added ${propertiesToAdd.length} property value(s)`;
    } else {
      message = `Successfully updated ${propertiesToUpdate.length} property value(s)`;
    }

    return createToolResult({
      success: true,
      message,
      updatedProperties: updatedPropertyKeys,
      addedProperties: addedPropertyKeys,
      element: updatedElement
    });
  }),
} satisfies ToolDefinition<typeof updateElementPropertiesSchema, typeof updateElementPropertiesOutputSchema.shape>;

export default withStandardDecorators(UpdateElementPropertiesTool);
