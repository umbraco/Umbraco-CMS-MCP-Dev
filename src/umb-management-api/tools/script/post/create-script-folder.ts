import { UmbracoManagementClient } from "@umb-management-client";
import { CreateScriptFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postScriptFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateScriptFolderTool = {
  name: "create-script-folder",
  description: "Creates a new script folder",
  schema: postScriptFolderBody.shape,
  isReadOnly: false,
  slices: ['create', 'folders'],
  handler: async (model: CreateScriptFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postScriptFolder(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postScriptFolderBody.shape>;

export default withStandardDecorators(CreateScriptFolderTool);