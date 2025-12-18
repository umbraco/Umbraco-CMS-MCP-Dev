import { UmbracoManagementClient } from "@umb-management-client";
import { getTreePartialViewSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewSiblingsTool = {
  name: "get-partial-view-siblings",
  description: "Gets sibling partial views for a given descendant path",
  schema: getTreePartialViewSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreePartialViewSiblings(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreePartialViewSiblingsQueryParams.shape>;

export default withStandardDecorators(GetPartialViewSiblingsTool);
