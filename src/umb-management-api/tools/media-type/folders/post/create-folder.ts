import { UmbracoManagementClient } from "@umb-management-client";
import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postMediaTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateMediaTypeFolderTool = {
  name: "create-media-type-folder",
  description: "Creates a new media type folder",
  schema: postMediaTypeFolderBody.shape,
  isReadOnly: false,
  slices: ['create', 'folders'],
  handler: async (model: CreateFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMediaTypeFolder(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postMediaTypeFolderBody.shape>;

export default withStandardDecorators(CreateMediaTypeFolderTool);
