import GetLanguageItemsTool from "./get/get-language-items.js";
import GetDefaultLanguageTool from "./get/get-default-language.js";
import GetLanguageByIsoCodeTool from "./get/get-language-by-iso-code.js";
import GetLanguageTool from "./get/get-language.js";
import CreateLanguageTool from "./post/create-language.js";
import UpdateLanguageTool from "./put/update-language.js";
import DeleteLanguageTool from "./delete/delete-language.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";

export const LanguageCollection: ToolCollectionExport = {
  metadata: {
    name: 'language',
    displayName: 'Languages',
    description: 'Language and localization configuration',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    tools.push(GetLanguageItemsTool());
    tools.push(GetDefaultLanguageTool());
    tools.push(GetLanguageTool());

    if (AuthorizationPolicies.TreeAccessLanguages(user)) {
      tools.push(CreateLanguageTool());
      tools.push(UpdateLanguageTool());
      tools.push(DeleteLanguageTool());
      tools.push(GetLanguageByIsoCodeTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const LanguageTools = (user: CurrentUserResponseModel) => {
  return LanguageCollection.tools(user);
};
