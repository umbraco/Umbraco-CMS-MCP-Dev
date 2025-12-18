import { UmbracoManagementClient } from "@umb-management-client";
import { getStylesheetFolderByPathParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetFolderByPathTool = {
  name: "get-stylesheet-folder-by-path",
  description: "Gets a stylesheet folder by its path",
  schema: getStylesheetFolderByPathParams.shape,
  isReadOnly: true,
  slices: ['read', 'folders'],
  handler: async (model: { path: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getStylesheetFolderByPath(model.path);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getStylesheetFolderByPathParams.shape>;

export default withStandardDecorators(GetStylesheetFolderByPathTool);