import { UmbracoManagementClient } from "@umb-management-client";
import { getItemTemplateQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplatesByIdArrayTool = {
  name: "get-templates-by-id-array",
  description: "Gets templates by IDs (or empty array if no IDs are provided)",
  schema: getItemTemplateQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: { id?: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemTemplate(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemTemplateQueryParams.shape>;

export default withStandardDecorators(GetTemplatesByIdArrayTool);