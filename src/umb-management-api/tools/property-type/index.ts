import { ToolDefinition } from "types/tool-definition.js";
import GetPropertyTypeIsUsedTool from "./get/get-property-type-is-used.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";

export const PropertyTypeCollection: ToolCollectionExport = {
  metadata: {
    name: 'property-type',
    displayName: 'Property Types',
    description: 'Property type usage and validation utilities',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [GetPropertyTypeIsUsedTool()];
    return tools
  }
};

// Backwards compatibility export
export const PropertyTypeTools = (user: CurrentUserResponseModel) => {
  return PropertyTypeCollection.tools(user);
};
