import GetManifestManifestTool from "./get/get-manifest-manifest.js";
import GetManifestManifestPrivateTool from "./get/get-manifest-manifest-private.js";
import GetManifestManifestPublicTool from "./get/get-manifest-manifest-public.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import { ToolDefinition } from "types/tool-definition.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";

export const ManifestCollection: ToolCollectionExport = {
  metadata: {
    name: 'manifest',
    displayName: 'Manifest',
    description: 'System manifests and extension definitions',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    if (AuthorizationPolicies.SectionAccessSettings(user)) {
      tools.push(GetManifestManifestTool());
      tools.push(GetManifestManifestPrivateTool());
      tools.push(GetManifestManifestPublicTool());
    }

    return tools;
  }
};

// Backwards compatibility export
export const ManifestTools = (user: CurrentUserResponseModel) => {
  return ManifestCollection.tools(user);
};