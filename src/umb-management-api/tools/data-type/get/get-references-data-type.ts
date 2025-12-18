import { UmbracoManagementClient } from "@umb-management-client";
import { getDataTypeByIdReferencedByParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetReferencesDataTypeTool = {
  name: "get-references-data-type",
  description: `Gets the document types and properties that use a specific data type.

  This is the recommended method to find all document types that reference a particular data type.

  Usage examples:
  - Find all document types using the RichText editor data type
  - Identify properties that reference a specific data type before modifying or deleting it
  - Perform bulk updates to all properties using a specific data type

  Returns a detailed list with content type information (id, type, name, icon) and all properties
  (name, alias) that use the specified data type.
  `,
  schema: getDataTypeByIdReferencedByParams.shape,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDataTypeByIdReferencedBy(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDataTypeByIdReferencedByParams.shape>;

export default withStandardDecorators(GetReferencesDataTypeTool);
