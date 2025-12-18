import CreateDocumentTypeTool from "./post/create-document-type.js";
import DeleteDocumentTypeTool from "./delete/delete-document-type.js";
import GetDocumentTypeTool from "./get/get-document-type-by-ids.js";
import UpdateDocumentTypeTool from "./put/update-document-type.js";
import CopyDocumentTypeTool from "./post/copy-document-type.js";
import MoveDocumentTypeTool from "./put/move-document-type.js";
import GetDocumentTypeRootTool from "./items/get/get-root.js";
import GetDocumentTypeChildrenTool from "./items/get/get-children.js";
import GetDocumentTypeAncestorsTool from "./items/get/get-ancestors.js";
import GetDocumentTypeSiblingsTool from "./items/get/get-siblings.js";
import CreateDocumentTypeFolderTool from "./folders/post/create-folder.js";
import DeleteDocumentTypeFolderTool from "./folders/delete/delete-folder.js";
import GetDocumentTypeFolderTool from "./folders/get/get-folder.js";
import UpdateDocumentTypeFolderTool from "./folders/put/update-folder.js";
import GetDocumentTypeBlueprintTool from "./get/get-document-type-blueprint.js";
import GetDocumentTypeCompositionReferencesTool from "./get/get-document-type-composition-references.js";
import GetDocumentTypeAvailableCompositionsTool from "./post/get-document-type-available-compositions.js";
import GetDocumentTypeAllowedChildrenTool from "./get/get-document-type-allowed-children.js";
import GetDocumentTypeConfigurationTool from "./get/get-document-type-configuration.js";
import GetDocumentTypesByIdArrayTool from "./get/get-document-type-by-id-array.js";
import GetIconsTool from "./templates/get-icons.js";
import CreateElementTypeTool from "./post/create-element-type.js";
import GetAllDocumentTypesTool from "./items/get/get-all.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const DocumentTypeCollection: ToolCollectionExport = {
  metadata: {
    name: 'document-type',
    displayName: 'Document Types',
    description: 'Document type definitions and composition management',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    tools.push(GetDocumentTypeTool);

    if (AuthorizationPolicies.TreeAccessDocumentsOrDocumentTypes(user)) {
      tools.push(GetDocumentTypeConfigurationTool);
      tools.push(GetDocumentTypeBlueprintTool);
      tools.push(GetDocumentTypesByIdArrayTool);
    }

    if (AuthorizationPolicies.TreeAccessDocumentTypes(user)) {
      tools.push(GetDocumentTypeAvailableCompositionsTool);
      tools.push(GetDocumentTypeCompositionReferencesTool);
      tools.push(UpdateDocumentTypeTool);
      tools.push(CopyDocumentTypeTool);
      tools.push(MoveDocumentTypeTool);
      tools.push(CreateDocumentTypeTool);
      tools.push(DeleteDocumentTypeTool);
      tools.push(CreateElementTypeTool);
      tools.push(GetIconsTool);
      tools.push(GetDocumentTypeAllowedChildrenTool);
      tools.push(GetAllDocumentTypesTool);

      tools.push(CreateDocumentTypeFolderTool);
      tools.push(DeleteDocumentTypeFolderTool);
      tools.push(GetDocumentTypeFolderTool);
      tools.push(UpdateDocumentTypeFolderTool);

      tools.push(GetDocumentTypeRootTool);
      tools.push(GetDocumentTypeAncestorsTool);
      tools.push(GetDocumentTypeChildrenTool);
      tools.push(GetDocumentTypeSiblingsTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const DocumentTypeTools = (user: CurrentUserResponseModel) => {
  return DocumentTypeCollection.tools(user);
};
