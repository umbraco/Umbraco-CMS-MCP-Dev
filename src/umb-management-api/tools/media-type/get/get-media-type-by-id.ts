import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeByIdTool = {
  name: "get-media-type-by-id",
  description: "Gets a media type by id",
  schema: getMediaTypeByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMediaTypeByIdParams.shape>;

export default withStandardDecorators(GetMediaTypeByIdTool);
