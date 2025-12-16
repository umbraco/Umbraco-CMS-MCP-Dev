import { UmbracoManagementClient } from "@umb-management-client";
import { CreateFolderRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDataTypeFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateDataTypeFolderTool = {
  name: "create-data-type-folder",
  description: "Creates a new data type folder",
  schema: postDataTypeFolderBody.shape,
  isReadOnly: false,
  slices: ['create', 'folders'],
  handler: async (model: CreateFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDataTypeFolder(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postDataTypeFolderBody.shape>;

export default withStandardDecorators(CreateDataTypeFolderTool);
