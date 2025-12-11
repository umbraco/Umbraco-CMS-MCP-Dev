import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerSavedSearchQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerSavedSearchParams } from "@/umb-management-api/schemas/index.js";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetLogViewerSavedSearchTool = CreateUmbracoReadTool(
  "get-log-viewer-saved-search",
  "Get log viewer saved searches",
  getLogViewerSavedSearchQueryParams.shape,
  async (model: GetLogViewerSavedSearchParams) => {
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
);

export default GetLogViewerSavedSearchTool;
