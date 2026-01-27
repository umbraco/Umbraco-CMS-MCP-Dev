import GetHealthCheckGroupsTool from "./get/get-health-check-groups.js";
import GetHealthCheckGroupByNameTool from "./get/get-health-check-group-by-name.js";
import RunHealthCheckGroupTool from "./post/run-health-check-group.js";
import ExecuteHealthCheckActionTool from "./post/execute-health-check-action.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const HealthCollection: ToolCollectionExport = {
  metadata: {
    name: 'health',
    displayName: 'Health Checks',
    description: 'System health monitoring and diagnostic capabilities',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    // Health checks are system-level operations requiring settings access
    if (AuthorizationPolicies.SectionAccessSettings(user)) {
      tools.push(GetHealthCheckGroupsTool);
      tools.push(GetHealthCheckGroupByNameTool);
      tools.push(RunHealthCheckGroupTool);
      tools.push(ExecuteHealthCheckActionTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const HealthTools = (user: CurrentUserResponseModel) => {
  return HealthCollection.tools(user);
};