import GetManifestManifestTool from "./get/get-manifest-manifest.js";
import GetManifestManifestPrivateTool from "./get/get-manifest-manifest-private.js";
import GetManifestManifestPublicTool from "./get/get-manifest-manifest-public.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { AuthorizationPolicies } from "auth/umbraco-auth-policies.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const ManifestCollection: ToolCollectionExport = {
  metadata: {
    name: 'manifest',
    displayName: 'Manifest',
    description: 'System manifests and extension definitions',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.SectionAccessSettings(user)) {
      tools.push(GetManifestManifestTool);
      tools.push(GetManifestManifestPrivateTool);
      tools.push(GetManifestManifestPublicTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const ManifestTools = (user: CurrentUserResponseModel) => {
  return ManifestCollection.tools(user);
};