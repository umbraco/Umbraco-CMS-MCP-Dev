import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getPartialViewSnippetByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetPartialViewSnippetByIdTool = CreateUmbracoReadTool(
  "get-partial-view-snippet-by-id",
  "Gets a specific partial view snippet by its ID",
  getPartialViewSnippetByIdParams.shape,
  async (model: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getPartialViewSnippetById(model.id);

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

export default GetPartialViewSnippetByIdTool;