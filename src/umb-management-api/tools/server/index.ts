import GetServerInformationTool from "./get/get-server-information.js";
import GetServerStatusTool from "./get/get-server-status.js";
import GetServerConfigurationTool from "./get/get-server-configuration.js";
import GetServerTroubleshootingTool from "./get/get-server-troubleshooting.js";
import GetServerUpgradeCheckTool from "./get/get-server-upgrade-check.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const ServerCollection: ToolCollectionExport = {
  metadata: {
    name: 'server',
    displayName: 'Server',
    description: 'Server information and system diagnostics',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    // Always available (AllowAnonymous in Umbraco, available to all authenticated users in MCP)
    tools.push(GetServerStatusTool);
    tools.push(GetServerConfigurationTool);

    // Available to all authenticated users (BackOfficeAccess)
    tools.push(GetServerInformationTool);
    tools.push(GetServerTroubleshootingTool);

    // Admin only (RequireAdminAccess)
    if (AuthorizationPolicies.RequireAdminAccess(user)) {
      tools.push(GetServerUpgradeCheckTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const ServerTools = (user: CurrentUserResponseModel) => {
  return ServerCollection.tools(user);
};