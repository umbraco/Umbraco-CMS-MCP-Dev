import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerLogQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerLogParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerLogTool = {
  name: "get-log-viewer-log",
  description: "Get log viewer logs",
  schema: getLogViewerLogQueryParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (model: GetLogViewerLogParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLogViewerLog(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getLogViewerLogQueryParams.shape>;

export default withStandardDecorators(GetLogViewerLogTool);
