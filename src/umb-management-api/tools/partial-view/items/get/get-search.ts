import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemPartialViewParams } from "@/umb-management-api/schemas/index.js";
import { getItemPartialViewQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetPartialViewSearchTool = {
  name: "get-partial-view-search",
  description: "Searches for partial views by name or path",
  schema: getItemPartialViewQueryParams.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async (model: GetItemPartialViewParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getItemPartialView(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemPartialViewQueryParams.shape>;

export default withStandardDecorators(GetPartialViewSearchTool);