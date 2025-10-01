import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getSearcherQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetSearcherParams } from "@/umb-management-api/schemas/index.js";

const GetSearcherTool = CreateUmbracoTool(
  "get-searcher",
  `Lists all searchers with pagination support.
  Returns an object containing:
  - total: Total number of searchers (number)
  - items: Array of searcher objects with name and isEnabled properties`,
  getSearcherQueryParams.shape,
  async (model: GetSearcherParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getSearcher(model);

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

export default GetSearcherTool;