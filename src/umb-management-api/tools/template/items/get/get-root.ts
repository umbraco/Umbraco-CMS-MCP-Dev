import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeTemplateRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateRootTool = {
  name: "get-template-root",
  description: "Gets root items for templates.",
  schema: getTreeTemplateRootQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: any) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeTemplateRoot(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeTemplateRootQueryParams.shape>;

export default withStandardDecorators(GetTemplateRootTool);