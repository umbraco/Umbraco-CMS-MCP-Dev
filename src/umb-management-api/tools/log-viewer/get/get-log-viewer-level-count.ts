import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerLevelCountQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerLevelCountParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerLevelCountTool = {
  name: "get-log-viewer-level-count",
  description: "Get log viewer level counts",
  schema: getLogViewerLevelCountQueryParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (model: GetLogViewerLevelCountParams) => {
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
} satisfies ToolDefinition<typeof getLogViewerLevelCountQueryParams.shape>;

export default withStandardDecorators(GetLogViewerLevelCountTool);
