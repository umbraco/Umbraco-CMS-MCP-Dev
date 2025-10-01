import GetDocumentBlueprintTool from "./get/get-blueprint.js";
import DeleteDocumentBlueprintTool from "./delete/delete-blueprint.js";
import UpdateDocumentBlueprintTool from "./put/update-blueprint.js";
import CreateDocumentBlueprintTool from "./post/create-blueprint.js";
import GetDocumentBlueprintAncestorsTool from "./get/get-ancestors.js";
import GetDocumentBlueprintChildrenTool from "./get/get-children.js";
import GetDocumentBlueprintRootTool from "./get/get-root.js";
import GetDocumentBlueprintScaffoldTool from "./get/get-document-blueprint-scaffold.js";
import CreateDocumentBlueprintFromDocumentTool from "./post/create-document-blueprint-from-document.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const DocumentBlueprintCollection: ToolCollectionExport = {
  metadata: {
    name: 'document-blueprint',
    displayName: 'Document Blueprints',
    description: 'Document blueprint templates and management',
    dependencies: ['document-type', 'document']
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    if (AuthorizationPolicies.TreeAccessDocumentTypes(user)) {

      tools.push(GetDocumentBlueprintTool());
      tools.push(DeleteDocumentBlueprintTool());
      tools.push(UpdateDocumentBlueprintTool());
      tools.push(CreateDocumentBlueprintTool());

      tools.push(GetDocumentBlueprintAncestorsTool());
      tools.push(GetDocumentBlueprintChildrenTool());
      tools.push(GetDocumentBlueprintRootTool());
      tools.push(GetDocumentBlueprintScaffoldTool());
      tools.push(CreateDocumentBlueprintFromDocumentTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const DocumentBlueprintTools = (user: CurrentUserResponseModel) => {
  return DocumentBlueprintCollection.tools(user);
};