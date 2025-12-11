import { UmbracoManagementClient } from "@umb-management-client";
import { postLogViewerSavedSearchBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { SavedLogSearchRequestModel } from "@/umb-management-api/schemas/index.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";

const PostLogViewerSavedSearchTool = CreateUmbracoWriteTool(
  "post-log-viewer-saved-search",
  "Create a new log viewer saved search",
  postLogViewerSavedSearchBody.shape,
  async (model: SavedLogSearchRequestModel) => {
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
);

export default PostLogViewerSavedSearchTool;
