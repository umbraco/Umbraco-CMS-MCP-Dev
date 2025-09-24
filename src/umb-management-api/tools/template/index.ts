import CreateTemplateTool from "./post/create-template.js";
import GetTemplateTool from "./get/get-template.js";
import GetTemplateConfigurationTool from "./get/get-template-configuration.js";
import GetTemplatesByIdArrayTool from "./get/get-template-by-id-array.js";
import UpdateTemplateTool from "./put/update-template.js";
import DeleteTemplateTool from "./delete/delete-template.js";

// Query operations
import ExecuteTemplateQueryTool from "./post/execute-template-query.js";
import GetTemplateQuerySettingsTool from "./get/get-template-query-settings.js";

// Tree operations
import GetTemplateAncestorsTool from "./items/get/get-ancestors.js";
import GetTemplateChildrenTool from "./items/get/get-children.js";
import GetTemplateRootTool from "./items/get/get-root.js";
import GetTemplateSearchTool from "./items/get/get-search.js";

import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const TemplateCollection: ToolCollectionExport = {
  metadata: {
    name: 'template',
    displayName: 'Templates',
    description: 'Razor template file management and query execution',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [GetTemplateSearchTool()];

    if (AuthorizationPolicies.TreeAccessTemplates(user)) {
      tools.push(GetTemplateTool());
      tools.push(GetTemplateConfigurationTool());
      tools.push(GetTemplatesByIdArrayTool());
      tools.push(CreateTemplateTool());
      tools.push(UpdateTemplateTool());
      tools.push(DeleteTemplateTool());

      // Query operations
      tools.push(ExecuteTemplateQueryTool());
      tools.push(GetTemplateQuerySettingsTool());

      // Tree operations
      tools.push(GetTemplateAncestorsTool());
      tools.push(GetTemplateChildrenTool());
      tools.push(GetTemplateRootTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const TemplateTools = (user: CurrentUserResponseModel) => {
  return TemplateCollection.tools(user);
};

// Legacy exports for backward compatibility
export { default as CreateTemplateTool } from "./post/create-template.js";
export { default as GetTemplateTool } from "./get/get-template.js";
export { default as GetTemplatesByIdArrayTool } from "./get/get-template-by-id-array.js";
export { default as UpdateTemplateTool } from "./put/update-template.js";
export { default as DeleteTemplateTool } from "./delete/delete-template.js";
export { default as ExecuteTemplateQueryTool } from "./post/execute-template-query.js";
export { default as GetTemplateQuerySettingsTool } from "./get/get-template-query-settings.js";
export { default as GetTemplateAncestorsTool } from "./items/get/get-ancestors.js";
export { default as GetTemplateChildrenTool } from "./items/get/get-children.js";
export { default as GetTemplateRootTool } from "./items/get/get-root.js";
export { default as GetTemplateSearchTool } from "./items/get/get-search.js";
