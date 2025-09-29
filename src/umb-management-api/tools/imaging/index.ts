import GetImagingResizeUrlsTool from "./get/get-imaging-resize-urls.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const ImagingCollection: ToolCollectionExport = {
  metadata: {
    name: 'imaging',
    displayName: 'Imaging',
    description: 'Image processing and URL generation utilities',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    return [
      GetImagingResizeUrlsTool()
    ];
  }
};

// Backwards compatibility export
export const ImagingTools = (user: CurrentUserResponseModel) => {
  return ImagingCollection.tools(user);
};