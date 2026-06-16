import GetElementByIdTool from "./get/get-element-by-id.js";
import GetElementConfigurationTool from "./get/get-element-configuration.js";
import GetElementAuditLogTool from "./get/get-element-audit-log.js";
import GetElementAreReferencedTool from "./get/get-element-are-referenced.js";
import GetElementByIdReferencedByTool from "./get/get-element-by-id-referenced-by.js";
import GetElementFolderReferencedDescendantsTool from "./get/get-element-folder-referenced-descendants.js";
import GetItemElementTool from "./get/get-item-element.js";
import SearchElementTool from "./get/search-element.js";
import GetRecycleBinElementOriginalParentTool from "./get/get-recycle-bin-element-original-parent.js";
import GetRecycleBinElementReferencedByTool from "./get/get-recycle-bin-element-referenced-by.js";
import GetRecycleBinElementFolderOriginalParentTool from "./get/get-recycle-bin-element-folder-original-parent.js";
import GetElementVersionTool from "./get/get-element-version.js";
import GetElementVersionByIdTool from "./get/get-element-version-by-id.js";
import GetElementRootTool from "./items/get/get-element-root.js";
import GetElementChildrenTool from "./items/get/get-element-children.js";
import GetElementAncestorsTool from "./items/get/get-element-ancestors.js";
import GetElementSiblingsTool from "./items/get/get-element-siblings.js";
import GetElementItemAncestorsTool from "./items/get/get-element-item-ancestors.js";
import GetRecycleBinElementRootTool from "./items/get/get-recycle-bin-element-root.js";
import GetRecycleBinElementChildrenTool from "./items/get/get-recycle-bin-element-children.js";
import GetRecycleBinElementSiblingsTool from "./items/get/get-recycle-bin-element-siblings.js";
import CreateElementTool from "./post/create-element.js";
import CopyElementTool from "./post/copy-element.js";
import ValidateElementTool from "./post/validate-element.js";
import RollbackElementVersionTool from "./post/rollback-element-version.js";
import UpdateElementTool from "./put/update-element.js";
import MoveElementTool from "./put/move-element.js";
import MoveElementToRecycleBinTool from "./put/move-element-to-recycle-bin.js";
import PublishElementTool from "./put/publish-element.js";
import UnpublishElementTool from "./put/unpublish-element.js";
import ValidateElementUpdateTool from "./put/validate-element-update.js";
import RestoreElementFromRecycleBinTool from "./put/restore-element-from-recycle-bin.js";
import SetElementVersionPreventCleanupTool from "./put/set-element-version-prevent-cleanup.js";
import DeleteElementTool from "./delete/delete-element.js";
import DeleteElementFromRecycleBinTool from "./delete/delete-element-from-recycle-bin.js";
import EmptyElementRecycleBinTool from "./delete/empty-element-recycle-bin.js";
import CreateElementFolderTool from "./folders/post/create-element-folder.js";
import GetElementFolderTool from "./folders/get/get-element-folder.js";
import GetItemElementFolderTool from "./folders/get/get-item-element-folder.js";
import UpdateElementFolderTool from "./folders/put/update-element-folder.js";
import MoveElementFolderTool from "./folders/put/move-element-folder.js";
import MoveElementFolderToRecycleBinTool from "./folders/put/move-element-folder-to-recycle-bin.js";
import RestoreElementFolderTool from "./folders/put/restore-element-folder.js";
import DeleteElementFolderTool from "./folders/delete/delete-element-folder.js";
import DeleteElementFolderFromRecycleBinTool from "./folders/delete/delete-element-folder-from-recycle-bin.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const ElementCollection: ToolCollectionExport = {
  metadata: {
    name: 'element',
    displayName: 'Elements',
    description: 'Element content management and publishing',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.TreeAccessElements(user)) {
      // Read
      tools.push(GetElementByIdTool);
      tools.push(GetElementConfigurationTool);
      tools.push(GetElementAuditLogTool);
      tools.push(GetElementAreReferencedTool);
      tools.push(GetElementByIdReferencedByTool);
      tools.push(GetElementFolderReferencedDescendantsTool);
      tools.push(GetItemElementTool);
      tools.push(SearchElementTool);
      tools.push(GetRecycleBinElementOriginalParentTool);
      tools.push(GetRecycleBinElementReferencedByTool);
      tools.push(GetRecycleBinElementFolderOriginalParentTool);
      tools.push(GetElementVersionTool);
      tools.push(GetElementVersionByIdTool);
      // Tree / items
      tools.push(GetElementRootTool);
      tools.push(GetElementChildrenTool);
      tools.push(GetElementAncestorsTool);
      tools.push(GetElementSiblingsTool);
      tools.push(GetElementItemAncestorsTool);
      tools.push(GetRecycleBinElementRootTool);
      tools.push(GetRecycleBinElementChildrenTool);
      tools.push(GetRecycleBinElementSiblingsTool);
      // Create / actions
      tools.push(CreateElementTool);
      tools.push(CopyElementTool);
      tools.push(ValidateElementTool);
      tools.push(RollbackElementVersionTool);
      tools.push(UpdateElementTool);
      tools.push(MoveElementTool);
      tools.push(MoveElementToRecycleBinTool);
      tools.push(PublishElementTool);
      tools.push(UnpublishElementTool);
      tools.push(ValidateElementUpdateTool);
      tools.push(RestoreElementFromRecycleBinTool);
      tools.push(SetElementVersionPreventCleanupTool);
      tools.push(DeleteElementTool);
      tools.push(DeleteElementFromRecycleBinTool);
      tools.push(EmptyElementRecycleBinTool);
      // Folders
      tools.push(CreateElementFolderTool);
      tools.push(GetElementFolderTool);
      tools.push(GetItemElementFolderTool);
      tools.push(UpdateElementFolderTool);
      tools.push(MoveElementFolderTool);
      tools.push(MoveElementFolderToRecycleBinTool);
      tools.push(RestoreElementFolderTool);
      tools.push(DeleteElementFolderTool);
      tools.push(DeleteElementFolderFromRecycleBinTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const ElementTools = (user: CurrentUserResponseModel) => {
  return ElementCollection.tools(user);
};
