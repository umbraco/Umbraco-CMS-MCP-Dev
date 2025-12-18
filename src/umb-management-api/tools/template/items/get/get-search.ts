import { UmbracoManagementClient } from "@umb-management-client";
import { getItemTemplateSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateSearchTool = {
  name: "get-template-search",
  description: "Searches the template tree for a template by name. It does NOT allow for searching for template folders.",
  schema: getItemTemplateSearchQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (params: any) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getItemTemplateSearch(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemTemplateSearchQueryParams.shape>;

export default withStandardDecorators(GetTemplateSearchTool);
