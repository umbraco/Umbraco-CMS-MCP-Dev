import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaByIdTool = {
  name: "get-media-by-id",
  description: `Gets a media item by id
  Use this to retrieve existing media items.`,
  schema: getMediaByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaById(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMediaByIdParams.shape>;

export default withStandardDecorators(GetMediaByIdTool);
