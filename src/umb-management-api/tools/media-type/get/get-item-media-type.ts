import { UmbracoManagementClient } from "@umb-management-client";
import { getItemMediaTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetItemMediaTypeTool = {
  name: "get-item-media-type",
  description: "Gets media type items by their ids",
  schema: getItemMediaTypeQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMediaType(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMediaTypeQueryParams.shape>;

export default withStandardDecorators(GetItemMediaTypeTool);
