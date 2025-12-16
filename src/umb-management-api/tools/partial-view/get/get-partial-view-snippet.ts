import { UmbracoManagementClient } from "@umb-management-client";
import { GetPartialViewSnippetParams } from "@/umb-management-api/schemas/index.js";
import { getPartialViewSnippetQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewSnippetTool = {
  name: "get-partial-view-snippet",
  description: "Gets partial view snippets with optional filtering",
  schema: getPartialViewSnippetQueryParams.shape,
  isReadOnly: true,
  slices: ['templates'],
  handler: async (model: GetPartialViewSnippetParams) => {
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
  },
} satisfies ToolDefinition<typeof getPartialViewSnippetQueryParams.shape>;

export default withStandardDecorators(GetPartialViewSnippetTool);