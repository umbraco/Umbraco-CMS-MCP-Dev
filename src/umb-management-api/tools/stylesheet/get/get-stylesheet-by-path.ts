import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getStylesheetByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetStylesheetByPathTool = CreateUmbracoReadTool(
  "get-stylesheet-by-path",
  "Gets a stylesheet by its path",
  getStylesheetByPathParams.shape,
  async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getStylesheetByPath(model.path);

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

export default GetStylesheetByPathTool;