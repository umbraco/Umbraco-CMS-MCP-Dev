import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateDocumentRequestModel } from "@/umb-management-api/schemas/createDocumentRequestModel.js";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const createDocumentSchema = z.object({
  documentTypeId: z.string().uuid("Must be a valid document type type UUID"),
  parentId: z.string().uuid("Must be a valid document UUID").optional(),
  name: z.string(),
  cultures: z.array(z.string()).optional().describe("Array of culture codes. If not provided or empty array, will create single variant with null culture."),
  values: z
    .array(
      z.object({
        editorAlias: z.string(),
        culture: z.string().nullable(),
        segment: z.string().nullable(),
        alias: z.string(),
        value: z.any(),
      })
    )
    .default([]),
});

const CreateDocumentTool = CreateUmbracoTool(
  "create-document",
  `Creates a document with support for multiple cultures.

  If cultures parameter is provided, a variant will be created for each culture code.
  If cultures parameter is not provided or is an empty array, will create a single variant with null culture (original behavior).

  Always follow these requirements when creating documents exactly, do not deviate in any way.

  ## CRITICAL WORKFLOW REQUIREMENTS
  1. ALWAYS first search for existing documents using search-document to find any documents that use the same document type
  2. If documents of the same type exist, use copy-document instead to duplicate and modify the existing structure
  3. ONLY if NO documents of the target document type exist should you analyze the document type structure
  4. When analyzing document types, use get-document-type-by-id to understand the required properties
  5. Then create the new document with the proper structure
  
  ## CRITICAL FOR DOCUMENT TYPES AND DATA TYPES
  1. BEFORE creating any new document type or data type, ALWAYS search for existing ones using get-document-type-root, get-document-type-search, or find-data-type
  2. ONLY create a new document type or data type if NO suitable existing ones are found
  3. If similar types exist, inform the user and suggest using the existing types instead
  4. Creation of new types should be a last resort when nothing suitable exists

  ## CRITICAL: For document types with allowedAsRoot=true, DO NOT include the parentId parameter at all in the function call.

  Values must match the aliases of the document type structure. 
  Block lists, Block Grids and Rich Text Blocks items and settings must match the defined blocks document type structures.

  ## CRITICAL: All generated keys must be unique and randomly generated.

  ## PROPERTY EDITOR VALUES

  When creating documents, you need to provide property values that match the property editors defined in the document type.

  IMPORTANT: Use the get-document-property-value-template tool to:
  - View all available property editors (call without parameters)
  - Get the correct value structure for a specific property editor (call with editorAlias parameter)
  - Each template provides the editorAlias and value format
  - You must add culture, segment, and alias based on your document's specific requirements

  The values parameter is an array of property value objects following this structure:
  {
    "editorAlias": "Umbraco.TextBox",  // From template - the property editor type
    "culture": null,                    // Document-specific - culture code or null
    "segment": null,                    // Document-specific - segment or null
    "alias": "propertyAlias",          // Document-specific - property alias from document type
    "value": "your value here"         // From template - customize the value structure
  }

  Note: Some property editors (BlockList, BlockGrid, ImageCropper, UploadField) have special requirements - check their templates for important notes.
  `,
  createDocumentSchema.shape,
  async (model) => {
    const client = UmbracoManagementClient.getClient();

    const documentId = uuidv4();

    // Determine cultures to use
    let culturesToUse: (string | null)[] = [];
    
    if (model.cultures === undefined || model.cultures.length === 0) {
      // If cultures not provided or empty array, use original behavior (null culture)
      culturesToUse = [null];
    } else {
      // Use provided cultures
      culturesToUse = model.cultures;
    }

    // Create variants for each culture
    const variants = culturesToUse.map(culture => ({
      culture,
      name: model.name,
      segment: null,
    }));

    const payload: CreateDocumentRequestModel = {
      id: documentId,
      documentType: {
        id: model.documentTypeId,
      },
      parent: model.parentId
        ? {
          id: model.parentId,
        }
        : undefined,
      template: null,
      values: model.values,
      variants,
    };

    const response = await client.postDocument(payload);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
  (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Create)
);

export default CreateDocumentTool;
