import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getPartialViewByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetPartialViewByPathTool = CreateUmbracoReadTool(
  "get-partial-view-by-path",
  "Gets a partial view by its path",
  getPartialViewByPathParams.shape,
  async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getPartialViewByPath(model.path);

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

export default GetPartialViewByPathTool;