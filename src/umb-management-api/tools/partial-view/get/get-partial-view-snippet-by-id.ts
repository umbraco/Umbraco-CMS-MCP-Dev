import { UmbracoManagementClient } from "@umb-management-client";
import { getPartialViewSnippetByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewSnippetByIdTool = {
  name: "get-partial-view-snippet-by-id",
  description: "Gets a specific partial view snippet by its ID",
  schema: getPartialViewSnippetByIdParams.shape,
  isReadOnly: true,
  slices: ['templates'],
  handler: async (model: { id: string }) => {
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
  },
} satisfies ToolDefinition<typeof getPartialViewSnippetByIdParams.shape>;

export default withStandardDecorators(GetPartialViewSnippetByIdTool);