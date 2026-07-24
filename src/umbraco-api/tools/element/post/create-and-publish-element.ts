import { UmbracoManagementClient } from "@umb-management-client";
import { CreateAndPublishElementRequestModel, CurrentUserResponseModel, ProblemDetails } from "@/umbraco-api/schemas/index.js";
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

export const createAndPublishOutputSchema = z.object({
  message: z.string(),
  id: z.string().guid()
});

const createAndPublishElementSchema = z.object({
  documentTypeId: z.string().uuid("Must be a valid document type UUID"),
  parentId: z.string().uuid("Must be a valid element UUID").optional(),
  name: z.string(),
  cultures: z.array(z.string()).optional().describe("Array of culture codes. If not provided or empty array, will create single variant with null culture."),
  culturesToPublish: z
    .array(z.string())
    .optional()
    .describe(
      "Culture codes to publish immediately after creation. Must contain real culture codes only - wildcards (\"*\") and nulls are rejected by Umbraco. If omitted, defaults to publishing every culture in the cultures array, or an empty array (which publishes the single invariant variant) when the element type does not vary by culture."
    ),
  values: z
    .array(
      z.object({
        culture: z.string().nullable(),
        segment: z.string().nullable(),
        alias: z.string(),
        value: z.any(),
      })
    )
    .default([]),
});

const CreateAndPublishElementTool = {
  name: "create-and-publish-element",
  description: `Creates an element and publishes it in a single operation, with support for multiple cultures.

  Always follow these requirements when creating elements exactly, do not deviate in any way.

  ## COPY-FIRST APPROACH (RECOMMENDED)

  **FIRST: Try to copy an existing element**
  1. Only use this if copy-element and search-element tools are available
  2. Use search-element to find elements with the same document type
  3. If similar elements exist AND copy-element tool is available:
     - Use copy-element to duplicate the existing structure
     - Use search-element to find the new element (copy returns empty string, not the new ID)
     - Update with update-element and publish with publish-element, or update-and-publish-element, as needed

  **SECOND: Only create from scratch when:**
  - No similar elements exist in Umbraco
  - copy-element tool doesn't exist
  - You need to create from scratch with unique structure

  Benefits: Preserves structure, inherits properties, maintains consistency with existing content.

  ## Introduction

  This tool creates and publishes elements with multi-culture support:
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

  ### Cultures To Publish
  - culturesToPublish controls which of the created variants get published immediately.
  - Umbraco only accepts real culture codes here - wildcards ("*") and nulls are rejected with an error.
  - When the element type does not vary by culture (invariant content), pass an empty array \`[]\` to publish the single invariant variant (this is the default when omitted).
  - When the element type varies by culture, culturesToPublish defaults to every culture supplied in the cultures array. Pass a subset to only publish some of the created variants.

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
  inputSchema: createAndPublishElementSchema.shape,
  outputSchema: createAndPublishOutputSchema.shape,
  slices: ['create'],
  enabled: (user: CurrentUserResponseModel) =>
    user.fallbackPermissions.includes(UmbracoElementPermissions.Create) &&
    user.fallbackPermissions.includes(UmbracoElementPermissions.Publish),
  handler: (async (model: z.infer<typeof createAndPublishElementSchema>) => {
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

    const payload: CreateAndPublishElementRequestModel = {
      id: elementId,
      documentType: {
        id: model.documentTypeId,
      },
      parent: model.parentId
        ? {
          id: model.parentId,
        }
        : undefined,
      culturesToPublish,
      values: model.values,
      variants,
    };

    // Get full response to check status
    const response = await client.postElementCreateAndPublish(payload, CAPTURE_RAW_HTTP_RESPONSE) as unknown as HttpResponse<ProblemDetails | void>;

    // Check if the element was created and published successfully
    if (response.status === 201 || response.status === 200) {
      return createToolResult({
        message: "Element created and published successfully",
        id: elementId
      });
    } else {
      // Element creation/publishing failed
      return createToolResultError(response.data || {
        status: response.status,
        detail: response.statusText
      });
    }
  }),
} satisfies ToolDefinition<typeof createAndPublishElementSchema.shape, typeof createAndPublishOutputSchema.shape>;

export default withStandardDecorators(CreateAndPublishElementTool);
