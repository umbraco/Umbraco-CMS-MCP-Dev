import { UmbracoManagementClient } from "@umb-management-client";
import { getIndexerByIndexNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetIndexerByIndexNameTool = {
  name: "get-indexer-by-index-name",
  description: `Gets a specific index by its name.
  Returns detailed information about the index including its configuration and status.`,
  schema: getIndexerByIndexNameParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (model: { indexName: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getIndexerByIndexName(model.indexName);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getIndexerByIndexNameParams.shape>;

export default withStandardDecorators(GetIndexerByIndexNameTool);