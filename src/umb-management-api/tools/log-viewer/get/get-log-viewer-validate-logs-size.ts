import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerValidateLogsSizeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerValidateLogsSizeParams } from "@/umb-management-api/schemas/index.js";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetLogViewerValidateLogsSizeTool = CreateUmbracoReadTool(
  "get-log-viewer-validate-logs-size",
  "Validates the size of the logs, for the given start and end date, or the lase day if not provided",
  getLogViewerValidateLogsSizeQueryParams.shape,
  async (model: GetLogViewerValidateLogsSizeParams) => {
    const client = UmbracoManagementClient.getClient();
    await client.getLogViewerValidateLogsSize(model);

    return {
      content: [
        {
          type: "text" as const,
          text: "allowed access",
        },
      ],
    };
  }
);

export default GetLogViewerValidateLogsSizeTool;
