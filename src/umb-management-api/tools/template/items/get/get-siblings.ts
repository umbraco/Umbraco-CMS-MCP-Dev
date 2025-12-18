import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeTemplateSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateSiblingsTool = {
  name: "get-template-siblings",
  description: "Gets sibling templates for a given descendant id",
  schema: getTreeTemplateSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: any) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeTemplateSiblings(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeTemplateSiblingsQueryParams.shape>;

export default withStandardDecorators(GetTemplateSiblingsTool);
