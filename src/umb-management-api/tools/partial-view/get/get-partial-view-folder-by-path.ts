import { UmbracoManagementClient } from "@umb-management-client";
import { getPartialViewFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewFolderByPathTool = {
  name: "get-partial-view-folder-by-path",
  description: "Gets a partial view folder by its path",
  schema: getPartialViewFolderByPathParams.shape,
  isReadOnly: true,
  slices: ['read', 'folders'],
  handler: async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getPartialViewFolderByPath(model.path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getPartialViewFolderByPathParams.shape>;

export default withStandardDecorators(GetPartialViewFolderByPathTool);