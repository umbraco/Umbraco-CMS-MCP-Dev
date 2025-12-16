import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemDataTypeSearchParams } from "@/umb-management-api/schemas/index.js";
import { getItemDataTypeSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeSearchTool = {
  name: "get-data-type-search",
  description: "Searches the data type tree for a data type by name. It does NOT allow for searching for data type folders.",
  schema: getItemDataTypeSearchQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (params: GetItemDataTypeSearchParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDataTypeSearch(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemDataTypeSearchQueryParams.shape>;

export default withStandardDecorators(GetDataTypeSearchTool);
