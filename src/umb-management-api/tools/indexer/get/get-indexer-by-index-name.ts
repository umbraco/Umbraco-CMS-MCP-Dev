import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getIndexerByIndexNameParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const GetIndexerByIndexNameTool = CreateUmbracoReadTool(
  "get-indexer-by-index-name",
  `Gets a specific index by its name.
  Returns detailed information about the index including its configuration and status.`,
  getIndexerByIndexNameParams.shape,
  async (model: { indexName: string }) => {
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
  }
);

export default GetIndexerByIndexNameTool;