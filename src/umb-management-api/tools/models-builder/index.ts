import GetModelsBuilderDashboardTool from "./get/get-models-builder-dashboard.js";
import GetModelsBuilderStatusTool from "./get/get-models-builder-status.js";
import PostModelsBuilderBuildTool from "./post/post-models-builder-build.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const ModelsBuilderCollection: ToolCollectionExport = {
  metadata: {
    name: 'models-builder',
    displayName: 'Models Builder',
    description: 'Models Builder management and code generation',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    return [
      GetModelsBuilderDashboardTool(),
      GetModelsBuilderStatusTool(),
      PostModelsBuilderBuildTool()
    ];
  }
};

// Backwards compatibility export
export const ModelsBuilderTools = (user: CurrentUserResponseModel) => {
  return ModelsBuilderCollection.tools(user);
};