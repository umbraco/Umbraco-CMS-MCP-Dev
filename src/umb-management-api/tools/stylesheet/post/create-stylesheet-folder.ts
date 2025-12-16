import { UmbracoManagementClient } from "@umb-management-client";
import { CreateStylesheetFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postStylesheetFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateStylesheetFolderTool = {
  name: "create-stylesheet-folder",
  description: "Creates a new stylesheet folder",
  schema: postStylesheetFolderBody.shape,
  isReadOnly: false,
  slices: ['create', 'folders'],
  handler: async (model: CreateStylesheetFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postStylesheetFolder(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof postStylesheetFolderBody.shape>;

export default withStandardDecorators(CreateStylesheetFolderTool);