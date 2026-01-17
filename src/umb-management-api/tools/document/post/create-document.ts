import { UmbracoManagementClient } from "@umb-management-client";
import { CreateDocumentRequestModel, CurrentUserResponseModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { AxiosResponse } from "axios";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const createOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

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

const CreateDocumentTool = {
  name: "create-document",
  description: `Creates a document with support for multiple cultures.

  Always follow these requirements when creating documents exactly, do not deviate in any way.

  ## COPY-FIRST APPROACH (RECOMMENDED)

  **FIRST: Try to copy an existing document**
  1. Only use this if copy-document and search-document tools are available
  2. Use search-document to find documents with the same document type
  3. If similar documents exist AND copy-document tool is available:
     - Use copy-document to duplicate the existing structure
     - Use search-document to find the new document (copy returns empty string, not the new ID)
     - Update with update-document and publish with publish-document as needed

  **SECOND: Only create from scratch when:**
  - No similar documents exist in Umbraco
  - Copy-document tool doesn't exist
  - You need to create from scratch with unique structure

  Benefits: Preserves structure, inherits properties, maintains consistency with existing content.

  ## Introduction

  This tool creates documents with multi-culture support:
  - If cultures parameter is provided, a variant will be created for each culture code
  - If cultures parameter is not provided or is an empty array, will create a single variant with null culture (original behavior)

  ## Critical Requirements

  ### Document Type Analysis (When Creating from Scratch)
  1. Use get-document-type-by-id to understand the document type structure and required properties
  2. Ensure all required properties are included in the values array

  ### Document Types and Data Types
  1. BEFORE creating any new document type, ALWAYS search for existing ones using get-all-document-types
  2. BEFORE creating any new data type, ALWAYS search for existing ones using get-all-data-types
  3. ONLY create a new document type or data type if NO suitable existing ones are found
  4. If similar types exist, inform the user and suggest using the existing types instead
  5. Creation of new types should be a last resort when nothing suitable exists

  ### Parent ID Handling
  For document types with allowedAsRoot=true, DO NOT include the parentId parameter at all in the function call.
  When adding a parent, first find the parent using get-document-root or get-document-children and then use the id of the parent in the parentId parameter. Alway makes sure that the id is valid.

  ### Values Matching
  - Values must match the aliases of the document type structure
  - Block lists, Block Grids and Rich Text Blocks items and settings must match the defined blocks document type structures

  ### Unique Keys
  All generated keys must be unique and randomly generated.

  ## Property Editor Values Reference

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
  inputSchema: createDocumentSchema.shape,
  outputSchema: createOutputSchema.shape,
  slices: ['create'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Create),
  handler: (async (model: z.infer<typeof createDocumentSchema>) => {
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

    // Get full response to check status
    const response = await client.postDocument(payload, CAPTURE_RAW_HTTP_RESPONSE) as unknown as AxiosResponse<ProblemDetails | void>;

    // Check if the document was created successfully (201 Created)
    if (response.status === 201) {
      return createToolResult({
        message: "Document created successfully",
        id: documentId
      });
    } else {
      // Document creation failed
      return createToolResultError(response.data || {
        status: response.status,
        detail: response.statusText
      });
    }
  }),
} satisfies ToolDefinition<typeof createDocumentSchema.shape, typeof createOutputSchema.shape>;

export default withStandardDecorators(CreateDocumentTool);
