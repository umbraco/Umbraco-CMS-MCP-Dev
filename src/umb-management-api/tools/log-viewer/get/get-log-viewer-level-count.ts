import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerLevelCountQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerLevelCountParams } from "@/umb-management-api/schemas/index.js";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetLogViewerLevelCountTool = CreateUmbracoReadTool(
  "get-log-viewer-level-count",
  "Get log viewer level counts",
  getLogViewerLevelCountQueryParams.shape,
  async (model: GetLogViewerLevelCountParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLogViewerLevelCount(model);

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

export default GetLogViewerLevelCountTool;
