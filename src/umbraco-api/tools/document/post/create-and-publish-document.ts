import { UmbracoManagementClient } from "@umb-management-client";
import { CreateAndPublishDocumentRequestModel, CurrentUserResponseModel, ProblemDetails } from "@/umbraco-api/schemas/index.js";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";

export const createAndPublishOutputSchema = z.object({
  message: z.string(),
  id: z.string().guid()
});

const createAndPublishDocumentSchema = z.object({
  documentTypeId: z.string().uuid("Must be a valid document type type UUID"),
  parentId: z.string().uuid("Must be a valid document UUID").optional(),
  name: z.string(),
  templateId: z
    .string()
    .uuid("Must be a valid template UUID")
    .optional()
    .describe(
      "Optional template ID to apply to the document. If omitted, the document type's default template is applied automatically. Provide a value only when you need a specific allowed template other than the default."
    ),
  cultures: z.array(z.string()).optional().describe("Array of culture codes. If not provided or empty array, will create single variant with null culture."),
  culturesToPublish: z
    .array(z.string())
    .optional()
    .describe(
      "Culture codes to publish immediately after creation. Must contain real culture codes only - wildcards (\"*\") and nulls are rejected by Umbraco. If omitted, defaults to publishing every culture in the cultures array, or an empty array (which publishes the single invariant variant) when the document type does not vary by culture."
    ),
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

const CreateAndPublishDocumentTool = {
  name: "create-and-publish-document",
  description: `Creates a document and publishes it in a single operation, with support for multiple cultures.

  Always follow these requirements when creating documents exactly, do not deviate in any way.

  ## COPY-FIRST APPROACH (RECOMMENDED)

  **FIRST: Try to copy an existing document**
  1. Only use this if copy-document and search-document tools are available
  2. Use search-document to find documents with the same document type
  3. If similar documents exist AND copy-document tool is available:
     - Use copy-document to duplicate the existing structure
     - Use search-document to find the new document (copy returns empty string, not the new ID)
     - Update and publish with update-and-publish-document as needed

  **SECOND: Only create from scratch when:**
  - No similar documents exist in Umbraco
  - Copy-document tool doesn't exist
  - You need to create from scratch with unique structure

  Benefits: Preserves structure, inherits properties, maintains consistency with existing content.

  ## Introduction

  This tool creates and publishes documents with multi-culture support:
  - If cultures parameter is provided, a variant will be created for each culture code
  - If cultures parameter is not provided or is an empty array, will create a single variant with null culture (original behavior)
  - IMPORTANT: If workflow approval is required, use create-document followed by initiate-workflow-action instead.
    This tool bypasses approval workflows and publishes directly to the live site.

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

  ### Cultures To Publish
  - culturesToPublish controls which of the created variants get published immediately.
  - Umbraco only accepts real culture codes here - wildcards ("*") and nulls are rejected with an error.
  - When the document type does not vary by culture (invariant content), pass an empty array \`[]\` to publish the single invariant variant (this is the default when omitted).
  - When the document type varies by culture, culturesToPublish defaults to every culture supplied in the cultures array. Pass a subset to only publish some of the created variants.

  ## Property Editor Values Reference

  When creating documents, you need to provide property values that match the property editors defined in the document type.

  IMPORTANT: Use the get-document-type-schema tool to:
  - Get the JSON Schema describing the expected property structure for a specific document type
  - The schema includes all property definitions and their value formats
  - Use the schema to construct the correct values array for your document

  The values parameter is an array of property value objects following this structure:
  {
    "editorAlias": "Umbraco.TextBox",  // The property editor type
    "culture": null,                    // Document-specific - culture code or null
    "segment": null,                    // Document-specific - segment or null
    "alias": "propertyAlias",          // Property alias from document type
    "value": "your value here"         // Value matching the schema structure
  }

  ## Default Template

  The document type's default template is applied automatically. Pass an explicit \`templateId\` only when you need a specific allowed template other than the default. If the document type has no default template, the document is created without one.
  `,
  inputSchema: createAndPublishDocumentSchema.shape,
  outputSchema: createAndPublishOutputSchema.shape,
  slices: ['create'],
  enabled: (user: CurrentUserResponseModel) =>
    user.fallbackPermissions.includes(UmbracoDocumentPermissions.Create) &&
    user.fallbackPermissions.includes(UmbracoDocumentPermissions.Publish),
  handler: (async (model: z.infer<typeof createAndPublishDocumentSchema>) => {
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

    // Determine which cultures should be published immediately.
    // Umbraco rejects wildcards ("*") and nulls here - only real culture codes are valid.
    // For invariant content, an empty array publishes the single invariant variant.
    let culturesToPublish: string[];
    if (model.culturesToPublish && model.culturesToPublish.length > 0) {
      culturesToPublish = model.culturesToPublish;
    } else if (model.cultures === undefined || model.cultures.length === 0) {
      culturesToPublish = [];
    } else {
      culturesToPublish = model.cultures;
    }

    // Resolve the template: explicit override wins; otherwise use the
    // document type's default template (which may itself be null).
    let template: { id: string } | null;
    if (model.templateId) {
      template = { id: model.templateId };
    } else {
      const docType = await client.getDocumentTypeById(model.documentTypeId);
      template = docType.defaultTemplate?.id
        ? { id: docType.defaultTemplate.id }
        : null;
    }

    const payload: CreateAndPublishDocumentRequestModel = {
      id: documentId,
      documentType: {
        id: model.documentTypeId,
      },
      parent: model.parentId
        ? {
          id: model.parentId,
        }
        : undefined,
      template,
      culturesToPublish,
      values: model.values,
      variants,
    };

    // Get full response to check status
    const response = await client.postDocumentCreateAndPublish(payload, CAPTURE_RAW_HTTP_RESPONSE) as unknown as HttpResponse<ProblemDetails | void>;

    // Check if the document was created and published successfully
    if (response.status === 201 || response.status === 200) {
      return createToolResult({
        message: "Document created and published successfully",
        id: documentId
      });
    } else {
      // Document creation/publishing failed
      return createToolResultError(response.data || {
        status: response.status,
        detail: response.statusText
      });
    }
  }),
} satisfies ToolDefinition<typeof createAndPublishDocumentSchema.shape, typeof createAndPublishOutputSchema.shape>;

export default withStandardDecorators(CreateAndPublishDocumentTool);
