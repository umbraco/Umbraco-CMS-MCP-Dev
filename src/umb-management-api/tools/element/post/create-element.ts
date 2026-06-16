import { UmbracoManagementClient } from "@umb-management-client";
import { CreateElementRequestModel, CurrentUserResponseModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { UmbracoElementPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
  type HttpResponse,
} from "@umbraco-cms/mcp-server-sdk";

export const createOutputSchema = z.object({
  message: z.string(),
  id: z.string().guid()
});

const createElementSchema = z.object({
  documentTypeId: z.string().uuid("Must be a valid document type UUID"),
  parentId: z.string().uuid("Must be a valid element UUID").optional(),
  name: z.string(),
  cultures: z.array(z.string()).optional().describe("Array of culture codes. If not provided or empty array, will create single variant with null culture."),
  values: z
    .array(
      z.object({
        editorAlias: z.string().optional(),
        culture: z.string().nullable(),
        segment: z.string().nullable(),
        alias: z.string(),
        value: z.any(),
      })
    )
    .default([]),
});

const CreateElementTool = {
  name: "create-element",
  description: `Creates an element with support for multiple cultures.

  Always follow these requirements when creating elements exactly, do not deviate in any way.

  ## COPY-FIRST APPROACH (RECOMMENDED)

  **FIRST: Try to copy an existing element**
  1. Only use this if copy-element and search-element tools are available
  2. Use search-element to find elements with the same document type
  3. If similar elements exist AND copy-element tool is available:
     - Use copy-element to duplicate the existing structure
     - Use search-element to find the new element (copy returns empty string, not the new ID)
     - Update with update-element and publish with publish-element as needed

  **SECOND: Only create from scratch when:**
  - No similar elements exist in Umbraco
  - copy-element tool doesn't exist
  - You need to create from scratch with unique structure

  Benefits: Preserves structure, inherits properties, maintains consistency with existing content.

  ## Introduction

  This tool creates elements with multi-culture support:
  - If cultures parameter is provided, a variant will be created for each culture code
  - If cultures parameter is not provided or is an empty array, will create a single variant with null culture (original behavior)

  ## Critical Requirements

  ### Document Type Analysis (When Creating from Scratch)
  1. Use get-document-type-by-id to understand the element type structure and required properties
  2. Ensure all required properties are included in the values array

  ### Parent ID Handling
  For document types with allowedAsRoot=true, DO NOT include the parentId parameter at all in the function call.
  When adding a parent, first find the parent using get-element-root or get-element-children and then use the id of the parent in the parentId parameter. Always make sure that the id is valid.

  ### Values Matching
  - Values must match the aliases of the document type structure

  ### Unique Keys
  All generated keys must be unique and randomly generated.

  ## Property Editor Values Reference

  When creating elements, you need to provide property values that match the property editors defined in the document type.

  The values parameter is an array of property value objects following this structure:
  {
    "culture": null,                    // culture code or null
    "segment": null,                    // segment or null
    "alias": "propertyAlias",          // Property alias from document type
    "value": "your value here"         // Value matching the schema structure
  }
  `,
  inputSchema: createElementSchema.shape,
  outputSchema: createOutputSchema.shape,
  slices: ['create'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoElementPermissions.Create),
  handler: (async (model: z.infer<typeof createElementSchema>) => {
    const client = UmbracoManagementClient.getClient();

    const elementId = uuidv4();

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

    const payload: CreateElementRequestModel = {
      id: elementId,
      documentType: {
        id: model.documentTypeId,
      },
      parent: model.parentId
        ? {
          id: model.parentId,
        }
        : undefined,
      values: model.values,
      variants,
    };

    // Get full response to check status
    const response = await client.postElement(payload, CAPTURE_RAW_HTTP_RESPONSE) as unknown as HttpResponse<ProblemDetails | void>;

    // Check if the element was created successfully (201 Created)
    if (response.status === 201) {
      return createToolResult({
        message: "Element created successfully",
        id: elementId
      });
    } else {
      // Element creation failed
      return createToolResultError(response.data || {
        status: response.status,
        detail: response.statusText
      });
    }
  }),
} satisfies ToolDefinition<typeof createElementSchema.shape, typeof createOutputSchema.shape>;

export default withStandardDecorators(CreateElementTool);
