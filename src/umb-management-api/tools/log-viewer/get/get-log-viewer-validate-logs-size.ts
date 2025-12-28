import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerValidateLogsSizeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerValidateLogsSizeParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerValidateLogsSizeTool = {
  name: "get-log-viewer-validate-logs-size",
  description: "Validates the size of the logs, for the given start and end date, or the lase day if not provided",
  schema: getLogViewerValidateLogsSizeQueryParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (model: GetLogViewerValidateLogsSizeParams) => {
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
} satisfies ToolDefinition<typeof getLogViewerValidateLogsSizeQueryParams.shape>;

export default withStandardDecorators(GetLogViewerValidateLogsSizeTool);
