import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaTypeFolderByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeFolderTool = {
  name: "get-media-type-folder",
  description: "Gets a media type folder by Id",
  schema: getMediaTypeFolderByIdParams.shape,
  isReadOnly: true,
  slices: ['read', 'folders'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeFolderById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMediaTypeFolderByIdParams.shape>;

export default withStandardDecorators(GetMediaTypeFolderTool);
