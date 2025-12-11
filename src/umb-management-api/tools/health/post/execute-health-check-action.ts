import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { HealthCheckActionRequestModel } from "@/umb-management-api/schemas/index.js";
import { postHealthCheckExecuteActionBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const ExecuteHealthCheckActionTool = CreateUmbracoWriteTool(
  "execute-health-check-action",
  "Executes remedial actions for health issues. WARNING: This performs system remedial actions that may modify system configuration, files, or database content. Use with caution.",
  postHealthCheckExecuteActionBody.shape,
  async (model: HealthCheckActionRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postHealthCheckExecuteAction(model);

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

export default ExecuteHealthCheckActionTool;