import { UmbracoManagementClient } from "@umb-management-client";
import { getItemMediaTypeAllowedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetAllowedMediaTypeTool = {
  name: "get-allowed-media-type",
  description: "Gets allowed file extensions for media types",
  schema: getItemMediaTypeAllowedQueryParams.shape,
  isReadOnly: true,
  slices: ['configuration'],
  handler: async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemMediaTypeAllowed(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemMediaTypeAllowedQueryParams.shape>;

export default withStandardDecorators(GetAllowedMediaTypeTool);
