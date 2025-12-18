import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeTemplateAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateAncestorsTool = {
  name: "get-template-ancestors",
  description: "Gets the ancestors of a template by Id",
  schema: getTreeTemplateAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: any) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeTemplateAncestors(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeTemplateAncestorsQueryParams.shape>;

export default withStandardDecorators(GetTemplateAncestorsTool);
