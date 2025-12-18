import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerSavedSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerSavedSearchParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerSavedSearchTool = {
  name: "get-log-viewer-saved-search",
  description: "Get log viewer saved searches",
  schema: getLogViewerSavedSearchQueryParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (model: GetLogViewerSavedSearchParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLogViewerSavedSearch(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getLogViewerSavedSearchQueryParams.shape>;

export default withStandardDecorators(GetLogViewerSavedSearchTool);
