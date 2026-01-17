import GetAllRedirectsTool from "./get/get-all-redirects.js";
import GetRedirectByIdTool from "./get/get-redirect-by-id.js";
import DeleteRedirectTool from "./delete/delete-redirect.js";
import GetRedirectStatusTool from "./get/get-redirect-status.js";
import UpdateRedirectStatusTool from "./post/update-redirect-status.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import {
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const RedirectCollection: ToolCollectionExport = {
  metadata: {
    name: 'redirect',
    displayName: 'Redirects',
    description: 'URL redirect management and configuration',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.SectionAccessContent(user)) {
      tools.push(GetAllRedirectsTool);
      tools.push(GetRedirectByIdTool);
      tools.push(DeleteRedirectTool);
      tools.push(GetRedirectStatusTool);
      tools.push(UpdateRedirectStatusTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const RedirectTools = (user: CurrentUserResponseModel) => {
  return RedirectCollection.tools(user);
};