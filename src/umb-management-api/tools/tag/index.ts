import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import GetTagsTool from "./get/get-tags.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";

export const TagCollection: ToolCollectionExport = {
  metadata: {
    name: 'tag',
    displayName: 'Tag Management',
    description: 'Tag management and retrieval',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [GetTagsTool()];
    return tools;
  }
};