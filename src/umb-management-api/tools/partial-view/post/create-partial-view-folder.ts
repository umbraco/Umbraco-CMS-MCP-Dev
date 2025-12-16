import { UmbracoManagementClient } from "@umb-management-client";
import { CreatePartialViewFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postPartialViewFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreatePartialViewFolderTool = {
  name: "create-partial-view-folder",
  description: "Creates a new partial view folder",
  schema: postPartialViewFolderBody.shape,
  isReadOnly: false,
  slices: ['create', 'folders'],
  handler: async (model: CreatePartialViewFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postPartialViewFolder(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postPartialViewFolderBody.shape>;

export default withStandardDecorators(CreatePartialViewFolderTool);