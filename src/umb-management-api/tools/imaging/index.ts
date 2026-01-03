import GetImagingResizeUrlsTool from "./get/get-imaging-resize-urls.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import { ToolDefinition } from "types/tool-definition.js";
import { AuthorizationPolicies } from "@/helpers/auth/umbraco-auth-policies.js";

export const ImagingCollection: ToolCollectionExport = {
  metadata: {
    name: 'imaging',
    displayName: 'Imaging',
    description: 'Image processing and URL generation utilities',
    dependencies: ['media']
  },
  tools: (user: CurrentUserResponseModel) => {

    const tools: ToolDefinition<any, any>[] = [];

    if (AuthorizationPolicies.SectionAccessContentOrMedia(user)) {
      tools.push(GetImagingResizeUrlsTool);
    }

    return tools;
  }
};

// Backwards compatibility export
export const ImagingTools = (user: CurrentUserResponseModel) => {
  return ImagingCollection.tools(user);
};