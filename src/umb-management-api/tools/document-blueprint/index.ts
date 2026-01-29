import GetDocumentBlueprintTool from "./get/get-blueprint.js";
import DeleteDocumentBlueprintTool from "./delete/delete-blueprint.js";
import UpdateDocumentBlueprintTool from "./put/update-blueprint.js";
import CreateDocumentBlueprintTool from "./post/create-blueprint.js";
import GetDocumentBlueprintAncestorsTool from "./get/get-ancestors.js";
import GetDocumentBlueprintChildrenTool from "./get/get-children.js";
import GetDocumentBlueprintRootTool from "./get/get-root.js";
import GetDocumentBlueprintSiblingsTool from "./get/get-siblings.js";
import GetDocumentBlueprintScaffoldTool from "./get/get-document-blueprint-scaffold.js";
import CreateDocumentBlueprintFromDocumentTool from "./post/create-document-blueprint-from-document.js";
import GetDocumentBlueprintByIdArrayTool from "./get/get-document-blueprint-by-id-array.js";
import MoveDocumentBlueprintTool from "./put/move-blueprint.js";
import CreateDocumentBlueprintFolderTool from "./folders/post/create-folder.js";
import GetDocumentBlueprintFolderTool from "./folders/get/get-folder.js";
import UpdateDocumentBlueprintFolderTool from "./folders/put/update-folder.js";
import DeleteDocumentBlueprintFolderTool from "./folders/delete/delete-folder.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const DocumentBlueprintCollection: ToolCollectionExport = {
  metadata: {
    name: 'document-blueprint',
    displayName: 'Document Blueprints',
    description: 'Document blueprint templates and management',
    dependencies: ['document-type', 'document']
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.TreeAccessDocumentTypes(user)) {
      // Blueprint CRUD
      tools.push(GetDocumentBlueprintTool);
      tools.push(CreateDocumentBlueprintTool);
      tools.push(UpdateDocumentBlueprintTool);
      tools.push(DeleteDocumentBlueprintTool);
      tools.push(MoveDocumentBlueprintTool);

      // Blueprint queries
      tools.push(GetDocumentBlueprintByIdArrayTool);
      tools.push(GetDocumentBlueprintScaffoldTool);
      tools.push(CreateDocumentBlueprintFromDocumentTool);

      // Blueprint tree
      tools.push(GetDocumentBlueprintAncestorsTool);
      tools.push(GetDocumentBlueprintChildrenTool);
      tools.push(GetDocumentBlueprintRootTool);
      tools.push(GetDocumentBlueprintSiblingsTool);

      // Folder operations
      tools.push(CreateDocumentBlueprintFolderTool);
      tools.push(GetDocumentBlueprintFolderTool);
      tools.push(UpdateDocumentBlueprintFolderTool);
      tools.push(DeleteDocumentBlueprintFolderTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const DocumentBlueprintTools = (user: CurrentUserResponseModel) => {
  return DocumentBlueprintCollection.tools(user);
};