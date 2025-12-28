import { UmbracoManagementClient } from "@umb-management-client";
import { HealthCheckActionRequestModel } from "@/umb-management-api/schemas/index.js";
import { postHealthCheckExecuteActionBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const ExecuteHealthCheckActionTool = {
  name: "execute-health-check-action",
  description: "Executes remedial actions for health issues. WARNING: This performs system remedial actions that may modify system configuration, files, or database content. Use with caution.",
  schema: postHealthCheckExecuteActionBody.shape,
  isReadOnly: false,
  slices: ['diagnostics'],
  handler: async (model: HealthCheckActionRequestModel) => {
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
} satisfies ToolDefinition<typeof postHealthCheckExecuteActionBody.shape>;

export default withStandardDecorators(ExecuteHealthCheckActionTool);