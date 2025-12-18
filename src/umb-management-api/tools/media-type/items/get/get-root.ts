import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeMediaTypeRootParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeRootTool = {
  name: "get-media-type-root",
  description: "Gets the root level of the media type tree",
  schema: getTreeMediaTypeRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMediaTypeRootParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaTypeRoot(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMediaTypeRootQueryParams.shape>;

export default withStandardDecorators(GetMediaTypeRootTool);
