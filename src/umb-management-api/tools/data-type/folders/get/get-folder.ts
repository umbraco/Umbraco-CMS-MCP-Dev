import { UmbracoManagementClient } from "@umb-management-client";
import { getDataTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDataTypeFolderTool = {
  name: "get-data-type-folder",
  description: "Gets a data type folder by Id",
  schema: getDataTypeFolderByIdParams.shape,
  isReadOnly: true,
  slices: ['read', 'folders'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDataTypeFolderById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDataTypeFolderByIdParams.shape>;

export default withStandardDecorators(GetDataTypeFolderTool);
