import { UmbracoManagementClient } from "@umb-management-client";
import { CreateDataTypeRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Flattened schema - prevents LLM JSON stringification of parent object
const createDataTypeSchema = z.object({
  name: z.string().min(1),
  editorAlias: z.string().min(1),
  editorUiAlias: z.string(),
  values: z.array(z.object({
    alias: z.string(),
    value: z.any().nullish()
  })),
  parentId: z.string().uuid().optional()  // Flattened parent ID
});

type CreateDataTypeSchema = z.infer<typeof createDataTypeSchema>;

export const createDataTypeOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateDataTypeTool = {
  name: "create-data-type",
  description: `Creates a new data type

  *** CRITICAL WORKFLOW REQUIREMENT ***
  BEFORE creating any new data type, you MUST perform the following steps:
  1. First use the find-data-type function to search for existing data types with similar names and/or property editors
  2. Verify if an existing data type can satisfy the requirements
  3. Only proceed with creating a new data type if no suitable option exists
  4. If a similar data type exists, inform the user and suggest using this one instead.

  *** PROPERTY EDITOR CONFIGURATION ***
  When creating a new data type you will need to assign a property editor with the correct configuration.

  IMPORTANT: Use the get-data-type-schema tool to:
  - Get the JSON Schema for an existing data type by its Id to understand its configuration structure
  - Or use get-data-type-schemas to fetch schemas for multiple data types in a batch
  - The schema describes the expected value structure for the property editor

  *** VALIDATION ***
  If you are not asked for a property editor then stop and ask the user to provide one.
  If you are asked to create a data type for a property that already exists, then stop and ask the user to provide a unique name.

  `,
  inputSchema: createDataTypeSchema.shape,
  outputSchema: createDataTypeOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateDataTypeSchema) => {
    const client = UmbracoManagementClient.getClient();

    // Generate UUID for the data type
    const dataTypeId = uuidv4();

    // Transform: flat parentId -> nested parent object for API
    const payload: CreateDataTypeRequestModel = {
      name: model.name,
      editorAlias: model.editorAlias,
      editorUiAlias: model.editorUiAlias,
      values: model.values,
      id: dataTypeId,
      parent: model.parentId ? { id: model.parentId } : undefined,
    };

    const response = await client.postDataType(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      const output = {
        message: "Data type created successfully",
        id: dataTypeId
      };
      return createToolResult(output);
    } else {
      // Handle error - Umbraco API returns ProblemDetails as structured data
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof createDataTypeSchema.shape, typeof createDataTypeOutputSchema.shape>;

export default withStandardDecorators(CreateDataTypeTool);
