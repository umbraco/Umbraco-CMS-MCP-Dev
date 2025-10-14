import CreateDataTypeTool from "./post/create-data-type.js";
import DeleteDataTypeTool from "./delete/delete-data-type.js";
import FindDataTypeTool from "./get/find-data-type.js";
import GetDataTypeTool from "./get/get-data-type.js";
import GetDataTypeConfigurationTool from "./get/get-data-type-configuration.js";
import GetPropertyEditorTemplateTool from "./get/get-property-editor-template.js";
import UpdateDataTypeTool from "./put/update-data-type.js";
import CopyDataTypeTool from "./post/copy-data-type.js";
import IsUsedDataTypeTool from "./get/is-used-data-type.js";
import MoveDataTypeTool from "./put/move-data-type.js";
import GetReferencesDataTypeTool from "./get/get-references-data-type.js";
import CreateDataTypeFolderTool from "./folders/post/create-folder.js";
import DeleteDataTypeFolderTool from "./folders/delete/delete-folder.js";
import GetDataTypeFolderTool from "./folders/get/get-folder.js";
import GetDataTypeSearchTool from "./items/get/get-search.js";
import UpdateDataTypeFolderTool from "./folders/put/update-folder.js";
import GetDataTypeRootTool from "./items/get/get-root.js";
import GetDataTypeChildrenTool from "./items/get/get-children.js";
import GetDataTypeAncestorsTool from "./items/get/get-ancestors.js";
import GetAllDataTypesTool from "./items/get/get-all.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const DataTypeCollection: ToolCollectionExport = {
  metadata: {
    name: 'data-type',
    displayName: 'Data Types',
    description: 'Data type definitions and management',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [GetDataTypeSearchTool()];

    if (AuthorizationPolicies.TreeAccessDocumentsOrMediaOrMembersOrContentTypes(user)) {
      tools.push(GetReferencesDataTypeTool());
      tools.push(IsUsedDataTypeTool());
      tools.push(GetDataTypeTool());
      tools.push(GetDataTypeConfigurationTool());
      tools.push(GetPropertyEditorTemplateTool());
    }

    if (AuthorizationPolicies.TreeAccessDataTypes(user)) {
      tools.push(GetDataTypeRootTool());
      tools.push(GetDataTypeChildrenTool());
      tools.push(GetDataTypeAncestorsTool());
      tools.push(GetAllDataTypesTool());

      tools.push(DeleteDataTypeTool());
      tools.push(CreateDataTypeTool());
      tools.push(UpdateDataTypeTool());

      tools.push(CopyDataTypeTool());
      tools.push(MoveDataTypeTool());
    }

    if (AuthorizationPolicies.TreeAccessDocumentsOrDocumentTypes(user)) {
      tools.push(FindDataTypeTool());
    }

    if (AuthorizationPolicies.TreeAccessDataTypes(user)) {
      tools.push(CreateDataTypeFolderTool());
      tools.push(DeleteDataTypeFolderTool());
      tools.push(GetDataTypeFolderTool());
      tools.push(UpdateDataTypeFolderTool());
    }

    return tools;
  }
};

