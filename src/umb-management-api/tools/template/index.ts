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
import GetTemplateSiblingsTool from "./items/get/get-siblings.js";

import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const TemplateCollection: ToolCollectionExport = {
  metadata: {
    name: 'template',
    displayName: 'Templates',
    description: 'Razor template file management and query execution',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.TreeAccessTemplates(user)) {
      tools.push(GetTemplateTool);
      tools.push(GetTemplateConfigurationTool);
      tools.push(GetTemplatesByIdArrayTool);
      tools.push(CreateTemplateTool);
      tools.push(UpdateTemplateTool);
      tools.push(DeleteTemplateTool);

      // Query operations
      tools.push(ExecuteTemplateQueryTool);
      tools.push(GetTemplateQuerySettingsTool);

      // Tree operations
      tools.push(GetTemplateAncestorsTool);
      tools.push(GetTemplateChildrenTool);
      tools.push(GetTemplateRootTool);
      tools.push(GetTemplateSearchTool);
      tools.push(GetTemplateSiblingsTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const TemplateTools = (user: CurrentUserResponseModel) => {
  return TemplateCollection.tools(user);
};

