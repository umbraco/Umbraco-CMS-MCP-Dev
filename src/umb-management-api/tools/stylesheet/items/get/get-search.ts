import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemStylesheetParams } from "@/umb-management-api/schemas/index.js";
import { getItemStylesheetQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetSearchTool = {
  name: "get-stylesheet-search",
  description: "Searches for stylesheets by name or path",
  schema: getItemStylesheetQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: GetItemStylesheetParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getItemStylesheet(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getItemStylesheetQueryParams.shape>;

export default withStandardDecorators(GetStylesheetSearchTool);