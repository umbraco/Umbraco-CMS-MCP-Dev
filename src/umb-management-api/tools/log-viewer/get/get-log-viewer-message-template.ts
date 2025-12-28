import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerMessageTemplateQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerMessageTemplateParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetLogViewerMessageTemplateTool = {
  name: "get-log-viewer-message-template",
  description: "Get log viewer message templates",
  schema: getLogViewerMessageTemplateQueryParams.shape,
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async (model: GetLogViewerMessageTemplateParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getLogViewerMessageTemplate(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getLogViewerMessageTemplateQueryParams.shape>;

export default withStandardDecorators(GetLogViewerMessageTemplateTool);
