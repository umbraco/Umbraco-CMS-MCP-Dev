import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerLevelQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerLevelParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerLevelTool = {
  name: "get-log-viewer-level",
  description: "Get log viewer levels",
  schema: getLogViewerLevelQueryParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (model: GetLogViewerLevelParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLogViewerLevel(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getLogViewerLevelQueryParams.shape>;

export default withStandardDecorators(GetLogViewerLevelTool);
