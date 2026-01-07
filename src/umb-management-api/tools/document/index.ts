import DeleteDocumentTool from "./delete/delete-document.js";
import DeleteFromRecycleBinTool from "./delete/delete-from-recycle-bin.js";
import DeleteDocumentPublicAccessTool from "./delete/delete-document-public-access.js";
import DeleteDocumentRecycleBinItemTool from "./delete/delete-recycle-bin-item.js";
import GetDocumentByIdTool from "./get/get-document-by-id.js";
import GetDocumentDomainsTool from "./get/get-document-domains.js";
import GetDocumentNotificationsTool from "./get/get-document-notifications.js";
import GetDocumentPublicAccessTool from "./get/get-document-public-access.js";
import GetDocumentAuditLogTool from "./get/get-document-audit-log.js";
import GetDocumentPublishTool from "./get/get-document-publish.js";
import GetDocumentConfigurationTool from "./get/get-document-configuration.js";
import GetDocumentUrlsTool from "./get/get-document-urls.js";
import GetDocumentPropertyValueTemplateTool from "./get/get-document-property-value-template.js";
import SearchDocumentTool from "./get/search-document.js";
import GetCollectionDocumentByIdTool from "./get/get-collection-document-by-id.js";
import GetItemDocumentTool from "./get/get-item-document.js";
import GetDocumentAreReferencedTool from "./get/get-document-are-referenced.js";
import GetDocumentByIdReferencedByTool from "./get/get-document-by-id-referenced-by.js";
import GetDocumentByIdReferencedDescendantsTool from "./get/get-document-by-id-referenced-descendants.js";
import GetDocumentAvailableSegmentOptionsTool from "./get/get-document-available-segment-options.js";
import GetRecycleBinDocumentOriginalParentTool from "./get/get-recycle-bin-document-original-parent.js";
import GetRecycleBinDocumentReferencedByTool from "./get/get-recycle-bin-document-referenced-by.js";
import PostDocumentPublicAccessTool from "./post/post-document-public-access.js";
import ValidateDocumentTool from "./post/validate-document.js";
import CopyDocumentTool from "./post/copy-document.js";
import CreateDocumentTool from "./post/create-document.js";
import PutDocumentPublicAccessTool from "./put/put-document-public-access.js";
import PutDocumentDomainsTool from "./put/put-document-domains.js";
import PutDocumentNotificationsTool from "./put/put-document-notifications.js";
import PublishDocumentWithDescendantsTool from "./put/publish-document-with-descendants.js";
import UnpublishDocumentTool from "./put/unpublish-document.js";
import SortDocumentTool from "./put/sort-document.js";
import MoveDocumentTool from "./put/move-document.js";
import PublishDocumentTool from "./put/publish-document.js";
import EmptyRecycleBinTool from "./put/empty-recycle-bin.js";
import RestoreFromRecycleBinTool from "./put/restore-from-recycle-bin.js";
import MoveToRecycleBinTool from "./put/move-to-recycle-bin.js";
import UpdateDocumentTool from "./put/update-document.js";
import UpdateDocumentPropertiesTool from "./put/update-document-properties.js";
import UpdateBlockPropertyTool from "./put/update-block-property.js";
import GetDocumentRootTool from "./items/get/get-root.js";
import GetDocumentChildrenTool from "./items/get/get-children.js";
import GetDocumentAncestorsTool from "./items/get/get-ancestors.js";
import GetDocumentSiblingsTool from "./items/get/get-siblings.js";
import GetRecycleBinRootTool from "./items/get/get-recycle-bin-root.js";
import GetRecycleBinChildrenTool from "./items/get/get-recycle-bin-children.js";
import GetDocumentRecycleBinSiblingsTool from "./items/get/get-recycle-bin-siblings.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const DocumentCollection: ToolCollectionExport = {
  metadata: {
    name: 'document',
    displayName: 'Documents',
    description: 'Document content management and publishing',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
  const tools: ToolDefinition<any, any>[] = [];

  if (AuthorizationPolicies.TreeAccessDocuments(user)) {
    tools.push(GetDocumentByIdTool);
    tools.push(GetDocumentPublishTool);
    tools.push(GetDocumentConfigurationTool);
    tools.push(GetDocumentPropertyValueTemplateTool);
    tools.push(CopyDocumentTool);
    tools.push(CreateDocumentTool);
    tools.push(PostDocumentPublicAccessTool);
    tools.push(DeleteDocumentTool);
    tools.push(DeleteDocumentPublicAccessTool);
    tools.push(DeleteDocumentRecycleBinItemTool);
    tools.push(GetDocumentUrlsTool);
    tools.push(GetDocumentDomainsTool);
    tools.push(GetDocumentAuditLogTool);
    tools.push(GetDocumentPublicAccessTool);
    tools.push(MoveDocumentTool);
    tools.push(MoveToRecycleBinTool);
    tools.push(GetDocumentNotificationsTool);
    tools.push(PublishDocumentTool);
    tools.push(PublishDocumentWithDescendantsTool);
    tools.push(SortDocumentTool);
    tools.push(UnpublishDocumentTool);
    tools.push(UpdateDocumentTool);
    tools.push(UpdateDocumentPropertiesTool);
    tools.push(UpdateBlockPropertyTool);
    tools.push(PutDocumentDomainsTool);
    tools.push(PutDocumentNotificationsTool);
    tools.push(PutDocumentPublicAccessTool);
    tools.push(DeleteFromRecycleBinTool);
    tools.push(EmptyRecycleBinTool);
    tools.push(RestoreFromRecycleBinTool);
    tools.push(GetRecycleBinRootTool);
    tools.push(GetRecycleBinChildrenTool);
    tools.push(SearchDocumentTool);
    tools.push(ValidateDocumentTool);
    tools.push(GetCollectionDocumentByIdTool);
    tools.push(GetItemDocumentTool);
    tools.push(GetDocumentAreReferencedTool);
    tools.push(GetDocumentByIdReferencedByTool);
    tools.push(GetDocumentByIdReferencedDescendantsTool);
    tools.push(GetDocumentAvailableSegmentOptionsTool);
    tools.push(GetRecycleBinDocumentOriginalParentTool);
    tools.push(GetRecycleBinDocumentReferencedByTool);
  }

  if (AuthorizationPolicies.SectionAccessForContentTree(user)) {
    tools.push(GetDocumentRootTool);
    tools.push(GetDocumentChildrenTool);
    tools.push(GetDocumentAncestorsTool);
    tools.push(GetDocumentSiblingsTool);
    tools.push(GetDocumentRecycleBinSiblingsTool);
  }

  return tools;
  }
};

// Backwards compatibility export
export const DocumentTools = (user: CurrentUserResponseModel) => {
  return DocumentCollection.tools(user);
};