import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetPartialViewSnippetParams } from "@/umb-management-api/schemas/index.js";
import { getPartialViewSnippetQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetPartialViewSnippetTool = CreateUmbracoReadTool(
  "get-partial-view-snippet",
  "Gets partial view snippets with optional filtering",
  getPartialViewSnippetQueryParams.shape,
  async (model: GetPartialViewSnippetParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getPartialViewSnippet(model);

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

export default GetPartialViewSnippetTool;