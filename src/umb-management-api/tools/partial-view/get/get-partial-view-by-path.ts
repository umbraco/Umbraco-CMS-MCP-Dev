import { UmbracoManagementClient } from "@umb-management-client";
import { getPartialViewByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewByPathTool = {
  name: "get-partial-view-by-path",
  description: "Gets a partial view by its path",
  schema: getPartialViewByPathParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (model: { path: string }) => {
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
  },
} satisfies ToolDefinition<typeof getPartialViewByPathParams.shape>;

export default withStandardDecorators(GetPartialViewByPathTool);