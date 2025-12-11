import { UmbracoManagementClient } from "@umb-management-client";
import { getLogViewerMessageTemplateQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLogViewerMessageTemplateParams } from "@/umb-management-api/schemas/index.js";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetLogViewerMessageTemplateTool = CreateUmbracoReadTool(
  "get-log-viewer-message-template",
  "Get log viewer message templates",
  getLogViewerMessageTemplateQueryParams.shape,
  async (model: GetLogViewerMessageTemplateParams) => {
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
);

export default GetLogViewerMessageTemplateTool;
