import GetAllRedirectsTool from "./get/get-all-redirects.js";
import GetRedirectByIdTool from "./get/get-redirect-by-id.js";
import DeleteRedirectTool from "./delete/delete-redirect.js";
import GetRedirectStatusTool from "./get/get-redirect-status.js";
import UpdateRedirectStatusTool from "./post/update-redirect-status.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { AuthorizationPolicies } from "@/helpers/umbraco-auth-policies.js";

export const RedirectTools = (user: CurrentUserResponseModel) => {
  const tools: ToolDefinition<any>[] = [];

  if (AuthorizationPolicies.SectionAccessContent(user)) {

    tools.push(GetAllRedirectsTool());
    tools.push(GetRedirectByIdTool());
    tools.push(DeleteRedirectTool());
    tools.push(GetRedirectStatusTool());
    tools.push(UpdateRedirectStatusTool());
  }

  return tools;
};