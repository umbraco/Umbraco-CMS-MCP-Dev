import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeTemplateChildrenQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateChildrenTool = {
  name: "get-template-children",
  description: "Gets the children templates or template folders by the parent id",
  schema: getTreeTemplateChildrenQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: any) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeTemplateChildren(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeTemplateChildrenQueryParams.shape>;

export default withStandardDecorators(GetTemplateChildrenTool);
