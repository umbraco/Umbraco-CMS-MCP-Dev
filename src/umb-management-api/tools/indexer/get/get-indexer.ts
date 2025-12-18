import { UmbracoManagementClient } from "@umb-management-client";
import { getIndexerQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetIndexerParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetIndexerTool = {
  name: "get-indexer",
  description: `Lists all indexes with pagination support.
  Returns an object containing:
  - total: Total number of indexes (number)
  - items: Array of index objects with name, searcherName, and other properties`,
  schema: getIndexerQueryParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (model: GetIndexerParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getIndexer(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getIndexerQueryParams.shape>;

export default withStandardDecorators(GetIndexerTool);