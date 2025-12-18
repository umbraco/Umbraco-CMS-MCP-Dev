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
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

// Define the property schema for reuse
const propertySchema = z.object({
  alias: z.string().min(1).describe("The property alias to update or add"),
  value: z.any().nullish().describe("The new value for the property"),
  culture: z.string().nullish().describe("Optional culture code for variant properties (e.g., 'en-US')"),
  segment: z.string().nullish().describe("Optional segment identifier for variant properties"),
});

// Define the input schema
const updateDocumentPropertiesSchema = {
  id: z.string().uuid().describe("The unique identifier of the document to update"),
  properties: z.array(propertySchema).min(1).describe("Array of properties to update or add - at least one property is required")
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

const UpdateDocumentPropertiesTool = {
  name: "update-document-properties",
  description: `Updates or adds property values on a document without requiring the full document JSON payload.

  This tool simplifies property updates by handling the read-modify-write cycle internally.
  You can update existing properties, add new properties, or do both in a single call.

  Key features:
  - Update existing properties or add new ones
  - Property must exist on the document type (including compositions)
  - Full i18n support with culture and segment parameters
  - Automatic validation of property aliases against document type
  - Culture/segment requirements validated against property variance flags
  - Returns detailed error messages with available properties

  Example usage:
  - Update a single property: { id: "...", properties: [{ alias: "title", value: "New Title" }] }
  - Add a new property: { id: "...", properties: [{ alias: "author", value: "John Doe" }] }
  - Update with culture: { id: "...", properties: [{ alias: "title", value: "Nuevo Título", culture: "es-ES" }] }
  - Mix update and add: { id: "...", properties: [{ alias: "title", value: "New" }, { alias: "newProp", value: "Value" }] }`,
  schema: updateDocumentPropertiesSchema,
  isReadOnly: false,
  slices: ['update'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Update),
  handler: async (model: UpdateDocumentPropertiesModel) => {
    const client = UmbracoManagementClient.getClient();

    // Step 1: Fetch the current document
    const currentDocument = await client.getDocumentById(model.id);

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

    // Lazy-load document type properties only if needed (for adding new properties)
    let documentTypeProperties: ResolvedProperty[] | null = null;
    const getDocumentTypeProperties = async (): Promise<ResolvedProperty[]> => {
      if (documentTypeProperties === null) {
        try {
          documentTypeProperties = await getAllDocumentTypeProperties(currentDocument.documentType.id);
        } catch (error) {
          console.error("Failed to fetch document type properties:", error);
          documentTypeProperties = [];
        }
      }
      return documentTypeProperties;
    };

    for (const prop of model.properties) {
      // Check if property exists on document (update case)
      const existsOnDocument = currentDocument.values.some(v =>
        matchesProperty(v, prop.alias, prop.culture, prop.segment)
      );

      if (existsOnDocument) {
        // Property exists - this is an update
        propertiesToUpdate.push({
          alias: prop.alias,
          value: prop.value,
          culture: prop.culture,
          segment: prop.segment
        });
      } else {
        // Property doesn't exist on document - check if it's valid on document type
        const docTypeProperties = await getDocumentTypeProperties();
        const propertyDef = docTypeProperties.find(p => p.alias === prop.alias);

        if (propertyDef) {
          // Property exists on document type - validate culture/segment
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
        } else if (docTypeProperties.length > 0) {
          // Property doesn't exist on document type
          invalidAliases.push(getPropertyKey(prop.alias, prop.culture, prop.segment));
        } else {
          // Couldn't fetch document type - fall back to old behavior (invalid)
          invalidAliases.push(getPropertyKey(prop.alias, prop.culture, prop.segment));
        }
      }
    }

    // Step 3: Return error if there are validation issues
    // Note: documentTypeProperties is guaranteed to be loaded if we have variance errors or invalid aliases
    if (varianceErrors.length > 0) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            success: false,
            error: "Culture/segment validation failed",
            message: varianceErrors.join("; "),
            errors: varianceErrors,
            availableProperties: (documentTypeProperties ?? [] as ResolvedProperty[]).map(p => ({
              alias: p.alias,
              name: p.name,
              variesByCulture: p.variesByCulture,
              variesBySegment: p.variesBySegment
            }))
          }, null, 2)
        }]
      };
    }

    if (invalidAliases.length > 0) {
      const docTypeProps = documentTypeProperties ?? [] as ResolvedProperty[];
      const availableProperties = docTypeProps.length > 0
        ? docTypeProps.map(p => ({
            alias: p.alias,
            name: p.name,
            variesByCulture: p.variesByCulture,
            variesBySegment: p.variesBySegment
          }))
        : currentDocument.values.map(v => ({
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
            message: `The following properties do not exist on this document type: ${invalidAliases.join(", ")}`,
            invalidAliases,
            availableProperties
          }, null, 2)
        }]
      };
    }

    // Step 4: Validate property values against Data Type configuration
    const allPropertiesToValidate = [...propertiesToUpdate, ...propertiesToAdd];
    if (allPropertiesToValidate.length > 0) {
      // Get document type properties if not already loaded (needed for dataTypeId lookup)
      const docTypeProps = await getDocumentTypeProperties();

      const propsToValidate = allPropertiesToValidate
        .map(p => {
          const def = docTypeProps.find(d => d.alias === p.alias);
          return { alias: p.alias, value: p.value, dataTypeId: def?.dataTypeId ?? '' };
        })
        .filter(p => p.dataTypeId);

      if (propsToValidate.length > 0) {
        const valueValidation = await validatePropertiesBeforeSave(propsToValidate);
        if (!valueValidation.isValid) {
          return {
            content: [{
              type: "text" as const,
              text: JSON.stringify({
                success: false,
                error: "Property value validation failed",
                errors: valueValidation.errors
              }, null, 2)
            }]
          };
        }
      }
    }

    // Step 5: Merge updated properties with existing values
    const updatedValues: DocumentValueModel[] = currentDocument.values.map(existingValue => {
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
    const variants: DocumentVariantRequestModel[] = currentDocument.variants.map(v => ({
      culture: v.culture,
      segment: v.segment,
      name: v.name
    }));

    // Step 8: Build the update payload
    const updatePayload: UpdateDocumentRequestModel = {
      values: updatedValues,
      variants: variants,
      template: currentDocument.template
    };

    // Step 9: Update the document
    await client.putDocumentById(model.id, updatePayload);

    // Step 10: Re-fetch the document to return the updated state
    const updatedDocument = await client.getDocumentById(model.id);

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

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          success: true,
          message,
          updatedProperties: updatedPropertyKeys,
          addedProperties: addedPropertyKeys,
          document: updatedDocument
        }, null, 2)
      }]
    };
  },
} satisfies ToolDefinition<typeof updateDocumentPropertiesSchema>;

export default withStandardDecorators(UpdateDocumentPropertiesTool);
