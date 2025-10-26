import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CreateDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";

// Flattened schema - prevents LLM JSON stringification of parent object
const createDataTypeSchema = z.object({
  name: z.string().min(1),
  editorAlias: z.string().min(1),
  editorUiAlias: z.string(),
  values: z.array(z.object({
    alias: z.string(),
    value: z.any().nullish()
  })),
  id: z.string().uuid().nullish(),
  parentId: z.string().uuid().optional()  // Flattened parent ID
});

type CreateDataTypeSchema = z.infer<typeof createDataTypeSchema>;

const CreateDataTypeTool = CreateUmbracoTool(
  "create-data-type",
  `Creates a new data type
  
  *** CRITICAL WORKFLOW REQUIREMENT ***
  BEFORE creating any new data type, you MUST perform the following steps:
  1. First use the find-data-type function to search for existing data types with similar names and/or property editors
  2. Verify if an existing data type can satisfy the requirements
  3. Only proceed with creating a new data type if no suitable option exists
  4. If a similar data type exists, inform the user and suggest using this one instead.

  *** PROPERTY EDITOR CONFIGURATION ***
  When creating a new data type you will need to assign a property editor with the correct configuration.

  IMPORTANT: Use the get-data-type-property-editor-template tool to:
  - View all available property editors (call without parameters)
  - Get the correct configuration template for a specific property editor (call with editorName parameter)
  - Each template shows the required editorAlias, editorUiAlias, and values configuration
  - Customize the template values to match your specific requirements

  *** VALIDATION ***
  If you are not asked for a property editor then stop and ask the user to provide one.
  If you are asked to create a data type for a property that already exists, then stop and ask the user to provide a unique name.

  `,
  createDataTypeSchema.shape,
  async (model: CreateDataTypeSchema) => {
    const client = UmbracoManagementClient.getClient();

    // Transform: flat parentId -> nested parent object for API
    const payload: CreateDataTypeRequestModel = {
      name: model.name,
      editorAlias: model.editorAlias,
      editorUiAlias: model.editorUiAlias,
      values: model.values,
      id: model.id,
      parent: model.parentId ? { id: model.parentId } : undefined,
    };

    const response = await client.postDataType(payload);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);

export default CreateDataTypeTool;
