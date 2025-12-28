import { UmbracoManagementClient } from "@umb-management-client";
import { GetTreeMediaTypeAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeMediaTypeAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeAncestorsTool = {
  name: "get-media-type-ancestors",
  description: "Gets the ancestors of a media type",
  schema: getTreeMediaTypeAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: GetTreeMediaTypeAncestorsParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaTypeAncestors(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMediaTypeAncestorsQueryParams.shape>;

export default withStandardDecorators(GetMediaTypeAncestorsTool);
