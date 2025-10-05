import CreateMediaTool from "./post/create-media.js";
import CreateMediaMultipleTool from "./post/create-media-multiple.js";
import DeleteMediaTool from "./delete/delete-media.js";
import GetMediaByIdTool from "./get/get-media-by-id.js";
import UpdateMediaTool from "./put/update-media.js";
import GetMediaConfigurationTool from "./get/get-media-configuration.js";
import GetMediaUrlsTool from "./get/get-media-urls.js";
import ValidateMediaTool from "./post/validate-media.js";
import SortMediaTool from "./put/sort-media.js";
import GetMediaByIdArrayTool from "./get/get-media-by-id-array.js";
import MoveMediaTool from "./put/move-media.js";
import GetMediaAncestorsTool from "./items/get/get-ancestors.js";
import GetMediaChildrenTool from "./items/get/get-children.js";
import GetMediaRootTool from "./items/get/get-root.js";
import GetMediaAuditLogTool from "./get/get-media-audit-log.js";
import GetMediaRecycleBinRootTool from "./items/get/get-recycle-bin-root.js";
import GetMediaRecycleBinChildrenTool from "./items/get/get-recycle-bin-children.js";
import EmptyRecycleBinTool from "./delete/empty-recycle-bin.js";
import RestoreFromRecycleBinTool from "./put/restore-from-recycle-bin.js";
import MoveMediaToRecycleBinTool from "./put/move-to-recycle-bin.js";
import DeleteFromRecycleBinTool from "./delete/delete-from-recycle-bin.js";
import GetMediaAreReferencedTool from "./get/get-media-are-referenced.js";
import GetMediaByIdReferencedByTool from "./get/get-media-by-id-referenced-by.js";
import GetMediaByIdReferencedDescendantsTool from "./get/get-media-by-id-referenced-descendants.js";
import GetCollectionMediaTool from "./get/get-collection-media.js";
import GetRecycleBinMediaReferencedByTool from "./get/get-recycle-bin-media-referenced-by.js";
import GetRecycleBinMediaOriginalParentTool from "./get/get-recycle-bin-media-original-parent.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const MediaCollection: ToolCollectionExport = {
  metadata: {
    name: 'media',
    displayName: 'Media',
    description: 'Media asset management and organization',
    dependencies: ['temporary-file']
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    tools.push(GetMediaByIdTool());

    if (AuthorizationPolicies.SectionAccessForMediaTree(user)) {
      tools.push(GetMediaAncestorsTool());
      tools.push(GetMediaChildrenTool());
      tools.push(GetMediaRootTool());
    }

    if (AuthorizationPolicies.SectionAccessMedia(user)) {
      tools.push(CreateMediaTool());
      tools.push(CreateMediaMultipleTool());
      tools.push(DeleteMediaTool());
      tools.push(UpdateMediaTool());
      tools.push(GetMediaConfigurationTool());
      tools.push(GetMediaUrlsTool());
      tools.push(ValidateMediaTool());
      tools.push(SortMediaTool());
      tools.push(GetMediaByIdArrayTool());
      tools.push(MoveMediaTool());
      tools.push(GetMediaAuditLogTool());
      tools.push(GetMediaRecycleBinRootTool());
      tools.push(GetMediaRecycleBinChildrenTool());
      tools.push(EmptyRecycleBinTool());
      tools.push(RestoreFromRecycleBinTool());
      tools.push(MoveMediaToRecycleBinTool());
      tools.push(DeleteFromRecycleBinTool());
      tools.push(GetMediaAreReferencedTool());
      tools.push(GetMediaByIdReferencedByTool());
      tools.push(GetMediaByIdReferencedDescendantsTool());
      tools.push(GetCollectionMediaTool());
      tools.push(GetRecycleBinMediaReferencedByTool());
      tools.push(GetRecycleBinMediaOriginalParentTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const MediaTools = (user: CurrentUserResponseModel) => {
  return MediaCollection.tools(user);
};