import { UmbracoManagementClient } from "@umb-management-client";
import { postLogViewerSavedSearchBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { SavedLogSearchRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const PostLogViewerSavedSearchTool = {
  name: "post-log-viewer-saved-search",
  description: "Create a new log viewer saved search",
  schema: postLogViewerSavedSearchBody.shape,
  isReadOnly: false,
  slices: ['diagnostics'],
  handler: async (model: SavedLogSearchRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postLogViewerSavedSearch(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof postLogViewerSavedSearchBody.shape>;

export default withStandardDecorators(PostLogViewerSavedSearchTool);
