import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaTypeAllowedAtRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetMediaTypeAllowedAtRootParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeAllowedAtRootTool = {
  name: "get-media-type-allowed-at-root",
  description: "Get media types that are allowed at root level",
  schema: getMediaTypeAllowedAtRootQueryParams.shape,
  isReadOnly: true,
  slices: ['configuration'],
  handler: async (model: GetMediaTypeAllowedAtRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeAllowedAtRoot(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMediaTypeAllowedAtRootQueryParams.shape>;

export default withStandardDecorators(GetMediaTypeAllowedAtRootTool);
