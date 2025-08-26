import GetLogViewerTool from "./get/get-log-viewer-log.js";
import GetLogViewerLevelTool from "./get/get-log-viewer-level.js";
import GetLogViewerSearchTool from "./get/get-log-viewer-saved-search.js";
import GetLogViewerValidateLogsTool from "./get/get-log-viewer-validate-logs-size.js";
import GetLogViewerMessageTemplateTool from "./get/get-log-viewer-message-template.js";
import GetLogViewerSavedSearchByNameTool from "./get/get-log-viewer-saved-search-by-name.js";
import GetLogViewerLevelCountTool from "./get/get-log-viewer-level-count.js";
import PostLogViewerSavedSearchTool from "./post/post-log-viewer-saved-search.js";
import DeleteLogViewerSavedSearchByNameTool from "./delete/delete-log-viewer-saved-search-by-name.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { AuthorizationPolicies } from "@/helpers/umbraco-auth-policies.js";

export const LogViewerTools = (user: CurrentUserResponseModel) => {
  const tools: ToolDefinition<any>[] = [];

  if (AuthorizationPolicies.SectionAccessSettings(user)) {

    tools.push(GetLogViewerSavedSearchByNameTool());
    tools.push(GetLogViewerLevelCountTool());
    tools.push(PostLogViewerSavedSearchTool());
    tools.push(DeleteLogViewerSavedSearchByNameTool());


    tools.push(GetLogViewerTool())
    tools.push(GetLogViewerLevelTool());
    tools.push(GetLogViewerSearchTool());
    tools.push(GetLogViewerValidateLogsTool());
    tools.push(GetLogViewerMessageTemplateTool());
  }

  return tools;
}