import GetManifestManifestTool from "./get/get-manifest-manifest.js";
import GetManifestManifestPrivateTool from "./get/get-manifest-manifest-private.js";
import GetManifestManifestPublicTool from "./get/get-manifest-manifest-public.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const ManifestCollection: ToolCollectionExport = {
  metadata: {
    name: 'manifest',
    displayName: 'Manifest',
    description: 'System manifests and extension definitions',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    return [
      GetManifestManifestTool(),
      GetManifestManifestPrivateTool(),
      GetManifestManifestPublicTool()
    ];
  }
};

// Backwards compatibility export
export const ManifestTools = (user: CurrentUserResponseModel) => {
  return ManifestCollection.tools(user);
};