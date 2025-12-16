import { UmbracoManagementClient } from "@umb-management-client";
import { getItemDataTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypesByIdArrayTool = {
  name: "get-data-types-by-id-array",
  description: "Gets data types by IDs (or empty array if no IDs are provided)",
  schema: getItemDataTypeQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: { id?: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDataType(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemDataTypeQueryParams.shape>;

export default withStandardDecorators(GetDataTypesByIdArrayTool);
