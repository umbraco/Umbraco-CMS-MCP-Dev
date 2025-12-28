import { UmbracoManagementClient } from "@umb-management-client";
import { getScriptFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetScriptFolderByPathTool = {
  name: "get-script-folder-by-path",
  description: "Gets a script folder by path",
  schema: getScriptFolderByPathParams.shape,
  isReadOnly: true,
  slices: ['read', 'folders'],
  handler: async ({ path }: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getScriptFolderByPath(path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getScriptFolderByPathParams.shape>;

export default withStandardDecorators(GetScriptFolderByPathTool);