import { UmbracoManagementClient } from "@umb-management-client";
import { putMediaSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";

const SortMediaTool = CreateUmbracoWriteTool(
  "sort-media",
  "Sorts the order of media items under a parent.",
  putMediaSortBody.shape,
  async (model: any) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaSort(model);
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

export default SortMediaTool;
