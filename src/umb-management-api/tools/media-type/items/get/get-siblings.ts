import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeMediaTypeSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeSiblingsTool = {
  name: "get-media-type-siblings",
  description: "Gets sibling media types or media type folders for a given descendant id",
  schema: getTreeMediaTypeSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaTypeSiblings(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeMediaTypeSiblingsQueryParams.shape>;

export default withStandardDecorators(GetMediaTypeSiblingsTool);
