import CreateTemporaryFileTool from "./post/create-temporary-file.js";
import GetTemporaryFileTool from "./get/get-temporary-file.js";
import DeleteTemporaryFileTool from "./delete/delete-temporary-file.js";
import GetTemporaryFileConfigurationTool from "./get/get-temporary-file-configuration.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";
import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const TemporaryFileCollection: ToolCollectionExport = {
  metadata: {
    name: 'temporary-file',
    displayName: 'Temporary Files',
    description: 'Temporary file management and upload handling',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];
    tools.push(CreateTemporaryFileTool());
    tools.push(GetTemporaryFileTool());
    tools.push(DeleteTemporaryFileTool());
    tools.push(GetTemporaryFileConfigurationTool());
    return tools;
  }
};

// Backwards compatibility export
export const TemporaryFileTools = (user: CurrentUserResponseModel) => {
  return TemporaryFileCollection.tools(user);
}; 