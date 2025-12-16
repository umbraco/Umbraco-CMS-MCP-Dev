import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeMediaTypeChildrenParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeChildrenTool = {
  name: "get-media-type-children",
  description: "Gets the children of a media type",
  schema: getTreeMediaTypeChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMediaTypeChildrenParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaTypeChildren(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMediaTypeChildrenQueryParams.shape>;

export default withStandardDecorators(GetMediaTypeChildrenTool);
