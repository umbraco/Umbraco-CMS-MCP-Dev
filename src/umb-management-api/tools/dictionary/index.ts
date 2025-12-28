import DeleteDictionaryItemTool from "./delete/delete-dictionary-item.js";
import FindDictionaryItemTool from "./get/find-dictionary-item.js";
import GetDictionaryItemTool from "./get/get-dictionary-item.js";
import GetDictionaryByIdArrayTool from "./get/get-dictionary-by-id-array.js";
import CreateDictionaryItemTool from "./post/create-dictionary-item.js";
import UpdateDictionaryItemTool from "./put/update-dictionary-item.js";
import MoveDictionaryItemTool from "./put/move-dictionary-item.js";
import GetDictionaryRootTool from "./items/get/get-root.js";
import GetDictionaryChildrenTool from "./items/get/get-children.js";
import GetDictionaryAncestorsTool from "./items/get/get-ancestors.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const DictionaryCollection: ToolCollectionExport = {
  metadata: {
    name: 'dictionary',
    displayName: 'Dictionary',
    description: 'Dictionary item management and localization',
    dependencies: ['language'] // Dictionary items typically require language context
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [FindDictionaryItemTool];

    if (AuthorizationPolicies.TreeAccessDictionary(user)) {
      tools.push(CreateDictionaryItemTool);
      tools.push(GetDictionaryItemTool);
      tools.push(GetDictionaryByIdArrayTool);
      tools.push(DeleteDictionaryItemTool);
      tools.push(UpdateDictionaryItemTool);
      tools.push(MoveDictionaryItemTool);
    }

    if (AuthorizationPolicies.TreeAccessDictionaryOrTemplates(user)) {
      tools.push(GetDictionaryRootTool);
      tools.push(GetDictionaryChildrenTool);
      tools.push(GetDictionaryAncestorsTool);
    }

    return tools;
  }
};

// Backwards compatibility export (can be removed later)
export const DictionaryTools = (user: CurrentUserResponseModel) => {
  return DictionaryCollection.tools(user);
};
