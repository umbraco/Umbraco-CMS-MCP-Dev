import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getIndexerQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetIndexerParams } from "@/umb-management-api/schemas/index.js";

const GetIndexerTool = CreateUmbracoTool(
  "get-indexer",
  `Lists all indexes with pagination support.
  Returns an object containing:
  - total: Total number of indexes (number)
  - items: Array of index objects with name, searcherName, and other properties`,
  getIndexerQueryParams.shape,
  async (model: GetIndexerParams) => {
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
  }
);

export default GetIndexerTool;